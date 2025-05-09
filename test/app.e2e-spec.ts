import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import * as expressSession from 'express-session';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configService = app.get<ConfigService>(ConfigService);

    // Configure session middleware for testing
    app.use(
      expressSession({
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
        name: 'cal.track.sid',
        cookie: {
          httpOnly: true,
          secure: false,
        },
      }),
    );

    // Set up global prefix
    const apiPrefix = configService.get<string>('API_PREFIX', 'api');
    const apiVersion = configService.get<string>('API_VERSION', 'v1');
    app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return health check status', () => {
    const apiPrefix = configService.get<string>('API_PREFIX', 'api');
    const apiVersion = configService.get<string>('API_VERSION', 'v1');

    return request(app.getHttpServer())
      .get(`/${apiPrefix}/${apiVersion}/health`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
        expect(new Date(res.body.timestamp)).toBeInstanceOf(Date);
      });
  });
});
