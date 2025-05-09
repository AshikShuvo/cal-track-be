import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { AuthModule } from '../../src/auth/auth.module';
import { SharedModule } from '../../src/shared/shared.module';
import sessionConfig from '../../src/config/session.config';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as expressSession from 'express-session';

describe('OAuth Authentication (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [sessionConfig],
        }),
        PrismaModule,
        AuthModule,
        SharedModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get<PrismaService>(PrismaService);

    // Configure session middleware for testing
    app.use(
      expressSession({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: true, // Changed to true to ensure session is created
        name: 'cal.track.sid',
        cookie: {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
        },
      }),
    );

    // Set up global prefix
    const apiPrefix = 'api';
    const apiVersion = 'v1';
    app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);

    await app.init();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  describe('Google OAuth', () => {
    it('should redirect to Google login page', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/google')
        .expect(302)
        .expect('Location', /^https:\/\/accounts\.google\.com/);
    });

    // Note: We can't fully test the callback since it requires real Google authentication
    it('should have Google callback route configured', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/google/callback')
        .expect(302); // Will redirect since no valid session
    });
  });

  describe('Facebook OAuth', () => {
    it('should redirect to Facebook login page', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/facebook')
        .expect(302)
        .expect('Location', /^https:\/\/www\.facebook\.com/);
    });

    // Note: We can't fully test the callback since it requires real Facebook authentication
    it('should have Facebook callback route configured', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/facebook/callback')
        .expect(302); // Will redirect since no valid session
    });
  });

  // Test session handling
  describe('Session Management', () => {
    it('should maintain session across requests', async () => {
      const agent = request.agent(app.getHttpServer());
      
      // First request should set a session cookie
      await agent
        .get('/api/v1/auth/google')
        .expect(302)
        .expect('set-cookie', /cal\.track\.sid=/);

      // Subsequent request should include the session cookie
      await agent
        .get('/api/v1/auth/google')
        .expect(302)
        .expect((res) => {
          expect(res.headers['set-cookie']).toBeUndefined(); // No new cookie set
        });
    });
  });
}); 