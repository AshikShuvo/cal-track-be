import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@ApiTags('Role Test')
@Controller('role-test')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RoleTestController {
  @Get('user')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Test endpoint for USER role' })
  userEndpoint() {
    return { message: 'You have access to USER endpoint' };
  }

  @Get('moderator')
  @Roles(Role.MODERATOR)
  @ApiOperation({ summary: 'Test endpoint for MODERATOR role' })
  moderatorEndpoint() {
    return { message: 'You have access to MODERATOR endpoint' };
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Test endpoint for ADMIN role' })
  adminEndpoint() {
    return { message: 'You have access to ADMIN endpoint' };
  }

  @Get('mod-or-admin')
  @Roles(Role.MODERATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Test endpoint for MODERATOR or ADMIN role' })
  moderatorOrAdminEndpoint() {
    return { message: 'You have access to MODERATOR or ADMIN endpoint' };
  }
} 