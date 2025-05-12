import { StorageConfig } from '../storage/interfaces/storage-config.interface';

export const storageConfig: StorageConfig = {
  provider: 'local',
  basePath: 'uploads',
  baseUrl: 'http://localhost:3001/uploads',
  tempDir: 'temp',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
}; 