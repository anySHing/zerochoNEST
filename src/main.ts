import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import path from 'path';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const port = process.env.PORT || 3000;

  app.enableCors({
    origin: true,
    credentials: true,
  });
  /*
  Express에 직접 접근하여 static을 사용하는 방식 
  app.useStaticAssets(
    process.env.NODE_ENV === 'production'
      ? path.join(__dirname, '..', '..', 'uploads')
      : path.join(__dirname, '..', 'uploads'),
    { prefix: '/uploads' },
  );

  Nest에서 제공하는 모듈을 사용해 정적 파일을 제공하는 방법은 @Nestjs/serve-static을 다운받은 뒤 AppModule에서 ServestaticModule을 임포트하여 사용한다.
 */

  app.useGlobalFilters(new HttpExceptionFilter());
  const config = new DocumentBuilder()
    .setTitle('Sleact API')
    .setDescription('Sleact 백엔드 API 문서입니다.')
    .setVersion('1.0')
    .addCookieAuth('connect.sid')
    .addTag('tag setting')
    .build();

  app.useGlobalPipes(new ValidationPipe());
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  app.use(cookieParser());
  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: process.env.SECRET,
      cookie: {
        httpOnly: true,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(port);
  console.log(`listening on PORT: ${port}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
