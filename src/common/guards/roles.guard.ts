import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UnauthorizedRoleException } from '../exceptions/unauthorized-role.exception';

@Injectable()
export class RolesGuard implements CanActivate {
  private roleHierarchy = {
    [Role.ADMIN]: [Role.ADMIN, Role.MODERATOR, Role.USER],
    [Role.MODERATOR]: [Role.MODERATOR, Role.USER],
    [Role.USER]: [Role.USER],
  };

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.role) {
      throw new UnauthorizedRoleException(requiredRoles);
    }

    const allowedRoles = this.roleHierarchy[user.role] || [];
    const hasRequiredRole = requiredRoles.some((role) => allowedRoles.includes(role));
    
    if (!hasRequiredRole) {
      throw new UnauthorizedRoleException(requiredRoles);
    }

    return true;
  }
} 