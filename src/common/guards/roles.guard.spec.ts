import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '../enums/role.enum';
import { UnauthorizedRoleException } from '../exceptions/unauthorized-role.exception';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);

    mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: Role.USER }
        })
      })
    } as unknown as ExecutionContext;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.USER]);
    
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should allow access when user has one of multiple required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.MODERATOR, Role.USER]);
    
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw UnauthorizedRoleException when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.MODERATOR]);
    
    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedRoleException);
  });

  it('should throw UnauthorizedRoleException when user object is missing', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.USER]);
    
    const contextWithoutUser = {
      ...mockContext,
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({})
      })
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(contextWithoutUser)).toThrow(UnauthorizedRoleException);
  });

  it('should throw UnauthorizedRoleException when role property is missing', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.USER]);
    
    const contextWithoutRole = {
      ...mockContext,
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {}
        })
      })
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(contextWithoutRole)).toThrow(UnauthorizedRoleException);
  });
}); 