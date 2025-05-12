import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IStorageProvider, StorageResult } from '../interfaces/storage-provider.interface';
import { LocalStorageConfig, StorageConfig } from '../interfaces/storage-config.interface';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private config: LocalStorageConfig;

  async initialize(config: StorageConfig): Promise<void> {
    if (config.provider !== 'local') {
      throw new Error('Invalid provider type for LocalStorageProvider');
    }
    this.config = config as LocalStorageConfig;

    // Create directories if they don't exist
    if (this.config.createDirectories !== false) {
      await this.ensureDirectoryExists(this.config.basePath);
      await this.ensureDirectoryExists(this.config.tempDir);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<StorageResult> {
    if (!this.config) {
      throw new Error('Provider not initialized');
    }

    const fileId = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${fileId}${extension}`;
    const filePath = path.join(this.config.basePath, filename);

    // Validate file type
    if (!this.isAllowedFileType(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} not allowed`);
    }

    // Validate file size
    if (file.size > this.config.maxFileSize) {
      throw new Error(`File size ${file.size} exceeds maximum allowed size ${this.config.maxFileSize}`);
    }

    // Copy file to storage location
    await fs.copyFile(file.path, filePath);

    // Clean up temp file
    try {
      await fs.unlink(file.path);
    } catch (err) {
      console.warn('Failed to clean up temp file:', err);
    }

    return {
      fileId,
      url: `${this.config.baseUrl}/${filename}`,
      provider: 'local',
      metadata: {
        size: file.size,
        mimeType: file.mimetype,
        filename: file.originalname,
        path: filePath,
      },
    };
  }

  async getFileUrl(fileId: string): Promise<string> {
    if (!this.config) {
      throw new Error('Provider not initialized');
    }

    const files = await fs.readdir(this.config.basePath);
    const file = files.find(f => f.startsWith(fileId));
    
    if (!file) {
      throw new Error(`File ${fileId} not found`);
    }

    return `${this.config.baseUrl}/${file}`;
  }

  async deleteFile(fileId: string): Promise<void> {
    if (!this.config) {
      throw new Error('Provider not initialized');
    }

    const files = await fs.readdir(this.config.basePath);
    const file = files.find(f => f.startsWith(fileId));
    
    if (!file) {
      throw new Error(`File ${fileId} not found`);
    }

    await fs.unlink(path.join(this.config.basePath, file));
  }

  async fileExists(fileId: string): Promise<boolean> {
    if (!this.config) {
      throw new Error('Provider not initialized');
    }

    const files = await fs.readdir(this.config.basePath);
    return files.some(f => f.startsWith(fileId));
  }

  private async ensureDirectoryExists(dir: string): Promise<void> {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private isAllowedFileType(mimeType: string): boolean {
    return this.config.allowedMimeTypes.includes(mimeType);
  }
} 