import { Test } from '@nestjs/testing';
import { promises as fs } from 'fs';
import * as path from 'path';
import { LocalStorageProvider } from './local-storage.provider';
import { LocalStorageConfig } from '../interfaces/storage-config.interface';
import { v4 as uuidv4 } from 'uuid';

jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    copyFile: jest.fn(),
    unlink: jest.fn(),
    readdir: jest.fn(),
  },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('LocalStorageProvider', () => {
  let provider: LocalStorageProvider;
  let mockConfig: LocalStorageConfig;
  let mockUuid: string;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [LocalStorageProvider],
    }).compile();

    provider = module.get<LocalStorageProvider>(LocalStorageProvider);
    mockUuid = '123e4567-e89b-12d3-a456-426614174000';
    (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

    mockConfig = {
      provider: 'local',
      basePath: '/test/storage',
      baseUrl: 'http://localhost:3000/uploads',
      tempDir: '/test/temp',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png'],
      createDirectories: true,
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should create directories if they do not exist', async () => {
      (fs.access as jest.Mock).mockRejectedValue(new Error());
      
      await provider.initialize(mockConfig);

      expect(fs.mkdir).toHaveBeenCalledWith(mockConfig.basePath, { recursive: true });
      expect(fs.mkdir).toHaveBeenCalledWith(mockConfig.tempDir, { recursive: true });
    });

    it('should not create directories if they exist', async () => {
      (fs.access as jest.Mock).mockResolvedValue(undefined);
      
      await provider.initialize(mockConfig);

      expect(fs.mkdir).not.toHaveBeenCalled();
    });

    it('should throw error for invalid provider type', async () => {
      const invalidConfig = { ...mockConfig, provider: 's3' as 'local' };
      
      await expect(provider.initialize(invalidConfig)).rejects.toThrow('Invalid provider type');
    });
  });

  describe('uploadFile', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      destination: '/tmp',
      filename: 'test.jpg',
      path: '/tmp/test.jpg',
      buffer: Buffer.from('test'),
      stream: null as any,
    };

    beforeEach(async () => {
      await provider.initialize(mockConfig);
    });

    it('should successfully upload a file', async () => {
      const result = await provider.uploadFile(mockFile);

      expect(fs.copyFile).toHaveBeenCalledWith(
        mockFile.path,
        path.join(mockConfig.basePath, `${mockUuid}.jpg`)
      );
      expect(result).toEqual({
        fileId: mockUuid,
        url: `${mockConfig.baseUrl}/${mockUuid}.jpg`,
        provider: 'local',
        metadata: {
          size: mockFile.size,
          mimeType: mockFile.mimetype,
          filename: mockFile.originalname,
          path: path.join(mockConfig.basePath, `${mockUuid}.jpg`),
        },
      });
    });

    it('should throw error for unsupported file type', async () => {
      const invalidFile = { ...mockFile, mimetype: 'text/plain' };
      
      await expect(provider.uploadFile(invalidFile)).rejects.toThrow('File type text/plain not allowed');
    });

    it('should throw error for file size exceeding limit', async () => {
      const largeFile = { ...mockFile, size: 10 * 1024 * 1024 };
      
      await expect(provider.uploadFile(largeFile)).rejects.toThrow('File size');
    });
  });

  describe('getFileUrl', () => {
    beforeEach(async () => {
      await provider.initialize(mockConfig);
    });

    it('should return correct URL for existing file', async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([`${mockUuid}.jpg`]);
      
      const url = await provider.getFileUrl(mockUuid);
      
      expect(url).toBe(`${mockConfig.baseUrl}/${mockUuid}.jpg`);
    });

    it('should throw error for non-existent file', async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      
      await expect(provider.getFileUrl(mockUuid)).rejects.toThrow(`File ${mockUuid} not found`);
    });
  });

  describe('deleteFile', () => {
    beforeEach(async () => {
      await provider.initialize(mockConfig);
    });

    it('should delete existing file', async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([`${mockUuid}.jpg`]);
      
      await provider.deleteFile(mockUuid);
      
      expect(fs.unlink).toHaveBeenCalledWith(
        path.join(mockConfig.basePath, `${mockUuid}.jpg`)
      );
    });

    it('should throw error for non-existent file', async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      
      await expect(provider.deleteFile(mockUuid)).rejects.toThrow(`File ${mockUuid} not found`);
    });
  });

  describe('fileExists', () => {
    beforeEach(async () => {
      await provider.initialize(mockConfig);
    });

    it('should return true for existing file', async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([`${mockUuid}.jpg`]);
      
      const exists = await provider.fileExists(mockUuid);
      
      expect(exists).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);
      
      const exists = await provider.fileExists(mockUuid);
      
      expect(exists).toBe(false);
    });
  });
}); 