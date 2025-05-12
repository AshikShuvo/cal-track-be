import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { StorageConfig } from './interfaces/storage-config.interface';
import { IStorageProvider, StorageResult } from './interfaces/storage-provider.interface';
import { LocalStorageProvider } from './providers/local-storage.provider';

@Injectable()
export class StorageService implements OnModuleInit {
  private provider: IStorageProvider;

  constructor(
    @Inject('STORAGE_CONFIG') private config: StorageConfig,
    private localStorageProvider: LocalStorageProvider,
  ) {
    this.provider = this.initializeProvider();
  }

  async onModuleInit(): Promise<void> {
    await this.provider.initialize(this.config);
  }

  private initializeProvider(): IStorageProvider {
    switch (this.config.provider) {
      case 'local':
        return this.localStorageProvider;
      default:
        throw new Error(`Unsupported storage provider: ${this.config.provider}`);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<StorageResult> {
    return this.provider.uploadFile(file);
  }

  async getFileUrl(fileId: string): Promise<string> {
    return this.provider.getFileUrl(fileId);
  }

  async deleteFile(fileId: string): Promise<void> {
    return this.provider.deleteFile(fileId);
  }

  async fileExists(fileId: string): Promise<boolean> {
    return this.provider.fileExists(fileId);
  }
} 