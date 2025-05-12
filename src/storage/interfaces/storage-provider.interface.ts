import { StorageConfig } from './storage-config.interface';

export interface StorageResult {
  fileId: string;
  url: string;
  provider: string;
  metadata: {
    size: number;
    mimeType: string;
    filename: string;
    path?: string;
  };
}

export interface IStorageProvider {
  /**
   * Initialize the storage provider with configuration
   * @param config Provider configuration
   */
  initialize(config: StorageConfig): Promise<void>;

  /**
   * Upload a file to storage
   * @param file The file to upload
   * @returns Storage result with file details
   */
  uploadFile(file: Express.Multer.File): Promise<StorageResult>;

  /**
   * Get the URL for a stored file
   * @param fileId The file identifier
   * @returns The URL where the file can be accessed
   */
  getFileUrl(fileId: string): Promise<string>;

  /**
   * Delete a file from storage
   * @param fileId The file identifier
   */
  deleteFile(fileId: string): Promise<void>;

  /**
   * Check if a file exists in storage
   * @param fileId The file identifier
   * @returns boolean indicating if file exists
   */
  fileExists(fileId: string): Promise<boolean>;
} 