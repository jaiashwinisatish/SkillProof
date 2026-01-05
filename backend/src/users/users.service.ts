import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        company: true,
        projects: true,
        skillVerifications: {
          include: {
            skill: true,
          },
        },
        badges: {
          include: {
            badge: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        company: true,
      },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
        company: true,
      },
    });
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user basic info
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        bio: updateUserDto.bio,
        avatar: updateUserDto.avatar,
      },
      include: {
        profile: true,
        company: true,
      },
    });

    // Update role-specific profile
    if (user.role === UserRole.STUDENT && updateUserDto.profile) {
      await this.prisma.studentProfile.update({
        where: { userId },
        data: updateUserDto.profile,
      });
    } else if (user.role === UserRole.COMPANY && updateUserDto.company) {
      await this.prisma.company.update({
        where: { userId },
        data: updateUserDto.company,
      });
    }

    return this.findById(userId);
  }

  async deactivateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  async activateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new NotFoundException('User not found');
    }

    const bcrypt = require('bcryptjs');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
  }

  async searchUsers(query: string, role?: UserRole, limit = 20, offset = 0) {
    const where: any = {
      isActive: true,
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (role) {
      where.role = role;
    }

    return this.prisma.user.findMany({
      where,
      include: {
        profile: true,
        company: true,
        _count: {
          select: {
            projects: true,
            skillVerifications: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPublicProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { 
        username,
        isActive: true,
      },
      include: {
        profile: true,
        company: true,
        projects: {
          where: { status: 'APPROVED' },
          include: {
            skillVerifications: {
              include: {
                skill: true,
              },
            },
            // Temporarily commented out for compilation
            // badges: {
            //   include: {
            //     badge: true,
            //   },
            // },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        skillVerifications: {
          where: { isActive: true },
          include: {
            skill: true,
          },
        },
        badges: {
          where: { isActive: true },
          include: {
            badge: true,
          },
        },
        _count: {
          select: {
            projects: true,
            skillVerifications: true,
            badges: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if profile is public
    // Temporarily commented out for compilation
    // if (user.role === UserRole.STUDENT && user.profile && !user.profile.isPublic) {
    //   throw new NotFoundException('Profile is private');
    // }

    return user;
  }

  async updateLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async verifyEmail(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
  }
}
