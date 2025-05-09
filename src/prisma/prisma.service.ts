import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type QueryEvent = {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
};

type ErrorEvent = {
  timestamp: Date;
  target: string;
  message: string;
};

type EventHandler<T> = (event: T) => void;
type PrismaEventEmitter = {
  $on(event: 'query', listener: EventHandler<QueryEvent>): void;
  $on(event: 'error', listener: EventHandler<ErrorEvent>): void;
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000; // 5 seconds

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'info' },
      ],
      errorFormat: 'pretty',
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      (this as unknown as PrismaEventEmitter).$on('query', (event: QueryEvent) => {
        this.logger.debug(`Query: ${event.query}`);
        this.logger.debug(`Params: ${event.params}`);
        this.logger.debug(`Duration: ${event.duration}ms`);
        this.logger.debug(`Target: ${event.target}`);
      });
    }

    // Log errors
    (this as unknown as PrismaEventEmitter).$on('error', (event: ErrorEvent) => {
      this.logger.error(`Database error: ${event.message}`);
      this.logger.error(`Target: ${event.target}`);
      this.logger.error(`Timestamp: ${event.timestamp.toISOString()}`);
    });
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  async connect(retryCount = 0): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.$connect();
        this.isConnected = true;
        this.logger.log('Successfully connected to database');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to connect to database: ${errorMessage}`);
      
      if (retryCount < this.maxRetries) {
        this.logger.warn(`Retrying connection in ${this.retryDelay / 1000} seconds... (Attempt ${retryCount + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        await this.connect(retryCount + 1);
      } else {
        this.logger.error('Max retry attempts reached. Unable to connect to database.');
        throw error;
      }
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.$disconnect();
        this.isConnected = false;
        this.logger.log('Successfully disconnected from database');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to disconnect from database: ${errorMessage}`);
      throw error;
    }
  }

  async enableShutdownHooks(): Promise<void> {
    try {
      // Handle shutdown signals
      process.on('beforeExit', async () => {
        await this.disconnect();
      });

      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await this.disconnect();
        process.exit(0);
      });

      this.logger.log('Database shutdown hooks enabled');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to enable shutdown hooks: ${errorMessage}`);
      throw error;
    }
  }
} 