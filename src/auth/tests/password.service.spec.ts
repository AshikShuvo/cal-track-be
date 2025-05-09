import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from '../services/password.service';
import * as bcrypt from 'bcrypt';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should successfully hash a password', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await service.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toEqual(password);
      expect(await bcrypt.compare(password, hashedPassword)).toBeTruthy();
    });

    it('should throw error when password hashing fails', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => Promise.reject(new Error('Hashing failed')));
      
      await expect(service.hashPassword('test')).rejects.toThrow('Password hashing failed');
    });
  });

  describe('verifyPassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await service.hashPassword(password);
      
      const isMatch = await service.verifyPassword(password, hashedPassword);
      expect(isMatch).toBeTruthy();
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await service.hashPassword(password);
      
      const isMatch = await service.verifyPassword('WrongPassword123!', hashedPassword);
      expect(isMatch).toBeFalsy();
    });

    it('should return false when verification fails', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(() => Promise.reject(new Error('Verification failed')));
      
      const isMatch = await service.verifyPassword('test', 'hashedTest');
      expect(isMatch).toBeFalsy();
    });
  });

  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const password = 'TestPassword123!';
      const result = service.validatePassword(password);
      
      expect(result.isValid).toBeTruthy();
      expect(result.errors).toHaveLength(0);
    });

    it('should reject an empty password', () => {
      const result = service.validatePassword('');
      
      expect(result.isValid).toBeFalsy();
      expect(result.errors).toContain('Password is required');
    });

    it('should reject a short password', () => {
      const result = service.validatePassword('Test1!');
      
      expect(result.isValid).toBeFalsy();
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject a long password', () => {
      const result = service.validatePassword('T'.repeat(33) + 'est1!');
      
      expect(result.isValid).toBeFalsy();
      expect(result.errors).toContain('Password must be at most 32 characters long');
    });

    it('should reject password without uppercase', () => {
      const result = service.validatePassword('testpassword123!');
      
      expect(result.isValid).toBeFalsy();
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const result = service.validatePassword('TESTPASSWORD123!');
      
      expect(result.isValid).toBeFalsy();
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without numbers', () => {
      const result = service.validatePassword('TestPassword!');
      
      expect(result.isValid).toBeFalsy();
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special characters', () => {
      const result = service.validatePassword('TestPassword123');
      
      expect(result.isValid).toBeFalsy();
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should collect multiple validation errors', () => {
      const result = service.validatePassword('test');
      
      expect(result.isValid).toBeFalsy();
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('generateValidPassword', () => {
    it('should generate a valid password', () => {
      const password = service.generateValidPassword();
      const validation = service.validatePassword(password);
      
      expect(validation.isValid).toBeTruthy();
      expect(validation.errors).toHaveLength(0);
    });

    it('should generate unique passwords', () => {
      const password1 = service.generateValidPassword();
      const password2 = service.generateValidPassword();
      
      expect(password1).not.toEqual(password2);
    });

    it('should generate password within length constraints', () => {
      const password = service.generateValidPassword();
      
      expect(password.length).toBeGreaterThanOrEqual(8);
      expect(password.length).toBeLessThanOrEqual(32);
    });

    it('should include all required character types', () => {
      const password = service.generateValidPassword();
      
      expect(password).toMatch(/[A-Z]/); // uppercase
      expect(password).toMatch(/[a-z]/); // lowercase
      expect(password).toMatch(/[0-9]/); // numbers
      expect(password).toMatch(/[!@#$%^&*(),.?":{}|<>]/); // special characters
    });
  });
}); 