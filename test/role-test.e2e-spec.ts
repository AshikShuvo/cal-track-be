import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Role } from '../src/common/enums/role.enum';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service';
import { TestDbHelper } from './utils/test-db.helper';
import { ConfigService } from '@nestjs/config';

describe('RoleTest (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let dbHelper: TestDbHelper;
  let testUsers: { user: any; moderator: any; admin: any };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    const prisma = moduleFixture.get<PrismaService>(PrismaService);
    dbHelper = new TestDbHelper(prisma);

    await app.init();
  });

  beforeEach(async () => {
    await dbHelper.cleanDb();
    testUsers = await dbHelper.createTestUsers();
  });

  afterAll(async () => {
    await dbHelper.cleanDb();
    await app.close();
  });

  const generateToken = (user: any) => {
    return jwtService.sign({ 
      sub: user.id,
      email: user.email,
      role: user.role
    });
  };

  describe('/role-test/user (GET)', () => {
    it('should allow USER role access', () => {
      const token = generateToken(testUsers.user);
      return request(app.getHttpServer())
        .get('/role-test/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect({
          message: 'You have access to USER endpoint',
        });
    });

    it('should allow MODERATOR role access', () => {
      const token = generateToken(testUsers.moderator);
      return request(app.getHttpServer())
        .get('/role-test/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should deny access without token', () => {
      return request(app.getHttpServer())
        .get('/role-test/user')
        .expect(401);
    });
  });

  describe('/role-test/moderator (GET)', () => {
    it('should allow MODERATOR role access', () => {
      const token = generateToken(testUsers.moderator);
      return request(app.getHttpServer())
        .get('/role-test/moderator')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect({
          message: 'You have access to MODERATOR endpoint',
        });
    });

    it('should deny USER role access', () => {
      const token = generateToken(testUsers.user);
      return request(app.getHttpServer())
        .get('/role-test/moderator')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });

  describe('/role-test/admin (GET)', () => {
    it('should allow ADMIN role access', () => {
      const token = generateToken(testUsers.admin);
      return request(app.getHttpServer())
        .get('/role-test/admin')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect({
          message: 'You have access to ADMIN endpoint',
        });
    });

    it('should deny MODERATOR role access', () => {
      const token = generateToken(testUsers.moderator);
      return request(app.getHttpServer())
        .get('/role-test/admin')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });

  describe('/role-test/mod-or-admin (GET)', () => {
    it('should allow MODERATOR role access', () => {
      const token = generateToken(testUsers.moderator);
      return request(app.getHttpServer())
        .get('/role-test/mod-or-admin')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect({
          message: 'You have access to MODERATOR or ADMIN endpoint',
        });
    });

    it('should allow ADMIN role access', () => {
      const token = generateToken(testUsers.admin);
      return request(app.getHttpServer())
        .get('/role-test/mod-or-admin')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should deny USER role access', () => {
      const token = generateToken(testUsers.user);
      return request(app.getHttpServer())
        .get('/role-test/mod-or-admin')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });
}); 