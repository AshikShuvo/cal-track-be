import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { StorageConfig } from './interfaces/storage-config.interface';
import { StorageResult } from './interfaces/storage-provider.interface';

describe('StorageService', () => {
  let service: StorageService;
  let localStorageProvider: LocalStorageProvider;
  let mockConfig: StorageConfig;

  const mockStorageResult: StorageResult = {
    fileId: 'test-id',
    url: 'http://localhost:3000/uploads/test-id.jpg',
    provider: 'local',
    metadata: {
      size: 1024,
      mimeType: 'image/jpeg',
      filename: 'test.jpg',
      path: '/test/storage/test-id.jpg',
    },
  };

  beforeEach(async () => {
    mockConfig = {
      provider: 'local',
      basePath: '/test/storage',
      baseUrl: 'http://localhost:3000/uploads',
      tempDir: '/test/temp',
      maxFileSize: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png'],
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: LocalStorageProvider,
          useValue: {
            initialize: jest.fn(),
            uploadFile: jest.fn(),
            getFileUrl: jest.fn(),
            deleteFile: jest.fn(),
            fileExists: jest.fn(),
          },
        },
        {
          provide: 'STORAGE_CONFIG',
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    localStorageProvider = module.get<LocalStorageProvider>(LocalStorageProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize the provider', async () => {
      await service.onModuleInit();
      expect(localStorageProvider.initialize).toHaveBeenCalledWith(mockConfig);
    });
  });

  describe('uploadFile', () => {
    it('should delegate to provider', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: '/tmp',
        filename: 'test.jpg',
        path: '/tmp/test.jpg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      (localStorageProvider.uploadFile as jest.Mock).mockResolvedValue(mockStorageResult);

      const result = await service.uploadFile(mockFile);
      expect(localStorageProvider.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual(mockStorageResult);
    });
  });

  describe('getFileUrl', () => {
    it('should delegate to provider', async () => {
      const fileId = 'test-id';
      const expectedUrl = 'http://localhost:3000/uploads/test-id.jpg';

      (localStorageProvider.getFileUrl as jest.Mock).mockResolvedValue(expectedUrl);

      const result = await service.getFileUrl(fileId);
      expect(localStorageProvider.getFileUrl).toHaveBeenCalledWith(fileId);
      expect(result).toBe(expectedUrl);
    });
  });

  describe('deleteFile', () => {
    it('should delegate to provider', async () => {
      const fileId = 'test-id';

      await service.deleteFile(fileId);
      expect(localStorageProvider.deleteFile).toHaveBeenCalledWith(fileId);
    });
  });

  describe('fileExists', () => {
    it('should delegate to provider', async () => {
      const fileId = 'test-id';
      (localStorageProvider.fileExists as jest.Mock).mockResolvedValue(true);

      const result = await service.fileExists(fileId);
      expect(localStorageProvider.fileExists).toHaveBeenCalledWith(fileId);
      expect(result).toBe(true);
    });
  });
}); 