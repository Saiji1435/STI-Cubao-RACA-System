// apps/api/src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Look for @Roles() metadata on the route or the whole controller
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, let the AuthGuard handle the rest
    if (!requiredRoles) {
      return true;
    }

    // 2. Extract the user from the request (injected by AuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // 3. Match user's role against the required list
    return requiredRoles.some((role) => user?.role === role);
  }
}