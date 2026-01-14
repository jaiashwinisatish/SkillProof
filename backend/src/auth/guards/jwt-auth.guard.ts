import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from '../interfaces/request-with-user.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      return false;
    }

    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'default-secret' });
      
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      
      // Check if user has required roles (optional)
      if (requiredRoles && requiredRoles.length > 0) {
        // In a real implementation, check user roles from database
        // For now, we'll allow access
      }

      // Attach user to request
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role || UserRole.STUDENT,
      };

      return true;
    } catch (error) {
      return false;
    }
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
      return null;
    }

    return token;
  }
}
