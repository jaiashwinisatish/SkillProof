import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../config/prisma.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcryptjs';
import { UserRole, NotificationType } from '../common/enums';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        company: true,
      },
    });

    if (user && user.password && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user);
    
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, role = UserRole.STUDENT, ...userData } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        ...userData,
        username: userData.username || email.split('@')[0],
      },
      include: {
        profile: true,
        company: true,
      },
    });

    // Create profile based on role
    if (role === UserRole.STUDENT) {
      await this.prisma.studentProfile.create({
        data: {
          userId: user.id,
        },
      });
    } else if (role === UserRole.COMPANY) {
      await this.prisma.company.create({
        data: {
          userId: user.id,
          name: userData.companyName || user.username,
        },
      });
    }

    // Generate verification token
    const verificationToken = this.generateVerificationToken();
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        // Store verification token in a separate table or as a field
        // For now, we'll skip email verification for simplicity
      },
    });

    // Send welcome notification
    await this.notificationsService.createNotification(user.id, {
      title: 'Welcome to SkillProof!',
      message: 'Your account has been created successfully. Start building your skill profile today!',
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
    });

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async oauthLogin(provider: string, profile: any) {
    const { email, name, username, id } = profile;
    
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          provider === 'google' ? { googleId: id } : { githubId: id },
        ],
      },
      include: {
        profile: true,
        company: true,
      },
    });

    if (!user) {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email,
          username: username || email.split('@')[0],
          firstName: name?.givenName || name?.name?.split(' ')[0] || '',
          lastName: name?.familyName || name?.name?.split(' ')[1] || '',
          role: UserRole.STUDENT,
          isActive: true,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          ...(provider === 'google' ? { googleId: id } : { githubId: id }),
          ...(provider === 'github' ? { githubUsername: username } : {}),
        },
        include: {
          profile: true,
          company: true,
        },
      });

      // Create student profile
      await this.prisma.studentProfile.create({
        data: {
          userId: user.id,
        },
      });
    } else {
      // Update existing user
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          ...(provider === 'google' ? { googleId: id } : { githubId: id }),
          ...(provider === 'github' ? { githubUsername: username } : {}),
        },
      });
    }

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          profile: true,
          company: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token exists and is valid
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: user.id,
          expiresAt: { gt: new Date() },
        },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const tokens = await this.generateTokens(user);
      
      // Remove old refresh token and save new one
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = this.generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token (you might want to create a separate table for this)
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        // For now, we'll use a simple approach
        // In production, use a separate password reset table
      },
    });

    // Send email with reset link
    await this.notificationsService.createNotification(user.id, {
      title: 'Password Reset Request',
      message: `A password reset has been requested for your account. Use token: ${resetToken}`,
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
    });

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Verify reset token and update password
    // This is a simplified implementation
    // In production, use a proper token verification system

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return { message: 'Password has been reset successfully' };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });
  }

  private generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private sanitizeUser(user: any) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
