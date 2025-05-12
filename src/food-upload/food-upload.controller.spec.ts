import { Test, TestingModule } from '@nestjs/testing';
import { FoodUploadController } from './food-upload.controller';
import { FoodUploadService } from './food-upload.service';
import { User } from '../auth/entities/user.entity';
import { MealType } from '../common/enums/meal-type.enum';
import { UserRole, AuthProvider } from '@prisma/client';

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

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedpassword',
  provider: AuthProvider.EMAIL,
  providerId: 'local-1',
  profileImageUrl: 'http://example.com/profile.jpg',
  role: UserRole.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

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
    const result = await controller.uploadFoodImage(mockFile, mockUser, MealType.BREAKFAST);
    expect(service.handleUpload).toHaveBeenCalledWith(mockFile, mockUser.id, MealType.BREAKFAST);
    expect(result).toBe(expected);
  });
}); 