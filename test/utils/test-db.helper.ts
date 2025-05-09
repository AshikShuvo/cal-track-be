import { PrismaService } from '../../src/prisma/prisma.service';
import { Role } from '../../src/common/enums/role.enum';
import { AuthProvider } from '@prisma/client';

export class TestDbHelper {
  constructor(private prisma: PrismaService) {}

  async cleanDb() {
    await this.prisma.user.deleteMany();
  }

  async createTestUsers() {
    const users = await Promise.all([
      this.prisma.user.create({
        data: {
          id: 'test-user-id',
          email: 'user@test.com',
          name: 'Test User',
          password: 'hashed_password',
          role: Role.USER,
          provider: AuthProvider.EMAIL,
          providerId: null,
          profileImageUrl: null,
        },
      }),
      this.prisma.user.create({
        data: {
          id: 'test-moderator-id',
          email: 'moderator@test.com',
          name: 'Test Moderator',
          password: 'hashed_password',
          role: Role.MODERATOR,
          provider: AuthProvider.EMAIL,
          providerId: null,
          profileImageUrl: null,
        },
      }),
      this.prisma.user.create({
        data: {
          id: 'test-admin-id',
          email: 'admin@test.com',
          name: 'Test Admin',
          password: 'hashed_password',
          role: Role.ADMIN,
          provider: AuthProvider.EMAIL,
          providerId: null,
          profileImageUrl: null,
        },
      }),
    ]);

    return {
      user: users[0],
      moderator: users[1],
      admin: users[2],
    };
  }
} 