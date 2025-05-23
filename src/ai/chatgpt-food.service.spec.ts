import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ChatGptFoodService } from './chatgpt-food.service';
import OpenAI from 'openai';

jest.mock('openai');

const mockCreate = jest.fn();
const mockOpenAI = jest.fn().mockImplementation(() => ({
  chat: {
    completions: {
      create: mockCreate,
    },
  },
}));
(OpenAI as unknown as jest.Mock) = mockOpenAI;

describe('ChatGptFoodService', () => {
  let service: ChatGptFoodService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'OPENAI_API_KEY') return 'test-api-key';
      return null;
    }),
  };

  beforeEach(async () => {
    mockCreate.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGptFoodService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ChatGptFoodService>(ChatGptFoodService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeFoodImage', () => {
    const mockImageBuffer = Buffer.from('test-image-data');

    it('should successfully analyze a food image', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: 'Pizza',
                portion: 200,
                nutrition: {
                  calories: 300,
                  protein: 12,
                  carbs: 35,
                  fat: 15,
                  fiber: 2,
                  sugar: 3,
                  sodium: 500,
                },
              }),
            },
          },
        ],
      };
      mockCreate.mockResolvedValueOnce(mockResponse);
      const result = await service.analyzeFoodImage(mockImageBuffer);
      expect(result).toEqual({
        name: 'Pizza',
        portion: 200,
        nutrition: {
          calories: 300,
          protein: 12,
          carbs: 35,
          fat: 15,
          fiber: 2,
          sugar: 3,
          sodium: 500,
        },
      });
    });

    it('should handle missing API key', async () => {
      mockConfigService.get.mockReturnValueOnce(null);
      const result = await service.analyzeFoodImage(mockImageBuffer);
      expect(result).toEqual({
        code: 'ANALYSIS_ERROR',
        message: 'Failed to analyze food image',
      });
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Invalid JSON',
            },
          },
        ],
      };
      mockCreate.mockResolvedValueOnce(mockResponse);
      const result = await service.analyzeFoodImage(mockImageBuffer);
      expect(result).toEqual({
        code: 'ANALYSIS_ERROR',
        message: 'Failed to analyze food image',
      });
    });

    it('should handle invalid response structure', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                name: 'Pizza',
                // Missing ingredients and nutrition
              }),
            },
          },
        ],
      };
      mockCreate.mockResolvedValueOnce(mockResponse);
      const result = await service.analyzeFoodImage(mockImageBuffer);
      expect(result).toEqual({
        code: 'ANALYSIS_ERROR',
        message: 'Failed to analyze food image',
      });
    });

    it('should handle API errors', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'));
      const result = await service.analyzeFoodImage(mockImageBuffer);
      expect(result).toEqual({
        code: 'ANALYSIS_ERROR',
        message: 'Failed to analyze food image',
      });
    });
  });
}); 