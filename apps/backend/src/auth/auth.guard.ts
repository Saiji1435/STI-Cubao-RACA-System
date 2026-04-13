// apps/api/src/auth/guards/auth.guard.ts
import { 
  CanActivate, 
  ExecutionContext, 
  Injectable, 
  UnauthorizedException, 
  ForbiddenException 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, User as PrismaUser } from '@prisma/client';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Better Auth attaches the user to the request
    // We cast it to PrismaUser so TypeScript sees the 'role' field
    const user = request.user as PrismaUser; 

    if (!user) {
      throw new UnauthorizedException('Access denied. Please log in.');
    }

    // 1. Check if the @Roles() decorator is present on the handler or class
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. If no roles are defined, just being logged in is enough
    if (!requiredRoles) {
      return true;
    }

    // 3. Match user's role against the required list (ADMIN, HEAD, etc.)
    const hasRole = requiredRoles.some((role) => user.role === role);
    
    if (!hasRole) {
      throw new ForbiddenException('Restricted: You do not have the required permissions.');
    }

    return true;
  }
}