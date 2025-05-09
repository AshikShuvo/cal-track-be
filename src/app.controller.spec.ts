import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IApiResponse } from './common/interfaces/api-response.interface';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHealth', () => {
    it('should return health status with correct structure', () => {
      // Act
      const response = appController.getHealth();

      // Assert
      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('statusCode');
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe('Service is healthy');
    });

    it('should return current timestamp in ISO format', () => {
      // Act
      const response = appController.getHealth();

      // Assert
      expect(response.data.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      const timestamp = new Date(response.data.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
    });

    it('should return ok status', () => {
      // Act
      const response = appController.getHealth();

      // Assert
      expect(response.data.status).toBe('ok');
    });

    it('should match the IApiResponse interface', () => {
      // Arrange
      type HealthResponse = IApiResponse<{ status: string; timestamp: string }>;

      // Act
      const response = appController.getHealth();

      // Assert
      const expectedStructure: HealthResponse = {
        data: {
          status: expect.any(String),
          timestamp: expect.any(String),
        },
        message: expect.any(String),
        statusCode: expect.any(Number),
      };

      expect(response).toMatchObject(expectedStructure);
    });
  });
});
