import { Test, TestingModule } from '@nestjs/testing';
import { RoleTestController } from './role-test.controller';

describe('RoleTestController', () => {
  let controller: RoleTestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleTestController],
    }).compile();

    controller = module.get<RoleTestController>(RoleTestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('userEndpoint', () => {
    it('should return success message for user endpoint', () => {
      expect(controller.userEndpoint()).toEqual({
        message: 'You have access to USER endpoint',
      });
    });
  });

  describe('moderatorEndpoint', () => {
    it('should return success message for moderator endpoint', () => {
      expect(controller.moderatorEndpoint()).toEqual({
        message: 'You have access to MODERATOR endpoint',
      });
    });
  });

  describe('adminEndpoint', () => {
    it('should return success message for admin endpoint', () => {
      expect(controller.adminEndpoint()).toEqual({
        message: 'You have access to ADMIN endpoint',
      });
    });
  });

  describe('moderatorOrAdminEndpoint', () => {
    it('should return success message for moderator or admin endpoint', () => {
      expect(controller.moderatorOrAdminEndpoint()).toEqual({
        message: 'You have access to MODERATOR or ADMIN endpoint',
      });
    });
  });
}); 