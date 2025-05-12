import { Test, TestingModule } from '@nestjs/testing';
import { FoodUploadController } from './food-upload.controller';
import { FoodUploadService } from './food-upload.service';

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

describe('FoodUploadController', () => {
  let controller: FoodUploadController;
  let service: FoodUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodUploadController],
      providers: [
        {
          provide: FoodUploadService,
          useValue: {
            handleUpload: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FoodUploadController>(FoodUploadController);
    service = module.get<FoodUploadService>(FoodUploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.handleUpload and return result', async () => {
    const expected = { fileId: 'abc', url: 'http://localhost/abc.jpg' };
    (service.handleUpload as jest.Mock).mockResolvedValue(expected);
    const result = await controller.uploadFoodImage(mockFile);
    expect(service.handleUpload).toHaveBeenCalledWith(mockFile);
    expect(result).toBe(expected);
  });
}); 