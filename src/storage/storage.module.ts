import { DynamicModule, Module } from '@nestjs/common';
import { StorageConfig } from './interfaces/storage-config.interface';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { StorageService } from './storage.service';

@Module({})
export class StorageModule {
  static register(config: StorageConfig): DynamicModule {
    return {
      module: StorageModule,
      providers: [
        {
          provide: 'STORAGE_CONFIG',
          useValue: config,
        },
        LocalStorageProvider,
        StorageService,
      ],
      exports: [StorageService],
    };
  }
} 