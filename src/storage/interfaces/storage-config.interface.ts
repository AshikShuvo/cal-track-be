export interface StorageConfig {
  provider: 'local' | 's3' | 'gcs';
  basePath: string;
  baseUrl: string;
  tempDir: string;
  maxFileSize: number;
  allowedMimeTypes: string[];
}

export interface LocalStorageConfig extends StorageConfig {
  provider: 'local';
  createDirectories?: boolean;
}

export type StorageConfigType = LocalStorageConfig; // Add other types as we implement them 