// apps/api/src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User authentication failed.');
    }

    // 🚀 SUPER ADMIN OVERRIDE: ADMIN_MAIN bypasses all role restrictions
    if (user.role === Role.ADMIN_MAIN) {
      return true;
    }

    // If no specific roles are required for this route, allow access
    if (!requiredRoles) {
      return true;
    }

    // Match user's role against the required list (for all other roles)
    const hasPermission = requiredRoles.some((role) => user.role === role);

    if (!hasPermission) {
      throw new ForbiddenException(`Access denied. Role ${user.role} does not have permission.`);
    }

    return hasPermission;
  }
}