import { ForbiddenException } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export class UnauthorizedRoleException extends ForbiddenException {
  constructor(requiredRoles: Role[]) {
    super(`You need one of these roles to access this resource: ${requiredRoles.join(', ')}`);
  }
} 