import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import session from 'express-session';
import passport from 'passport';
import request from 'supertest';
import { AppModule } from 'src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(
      session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        cookie: {
          httpOnly: true,
        },
      }),
    );
    app.use(passport.initialize());
    app.use(passport.session());
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/users/login (POST)', (done) => {
    return request(app.getHttpServer())
      .post('/api/users/login')
      .send({
        email: 'zeroch0@gmail.com',
        password: 'nodejsbook',
      })
      .expect(201, done);
  });
});
