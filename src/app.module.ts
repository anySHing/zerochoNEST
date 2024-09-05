import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddlware } from './middlewares/logger.middleware';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ChannelsModule } from './channels/channels.module';
import { DmsModule } from './dms/dms.module';
import { UsersService } from './users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  // forRoot, forFeature, register 등등이 붙는 것들은 파라미터 내부에 설정을 넣어주는 것이라고 보면 됨.
  imports: [
    ConfigModule.forRoot({ isGlobal: true /*  load: getEnv */ }),
    UsersModule,
    WorkspacesModule,
    ChannelsModule,
    DmsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
  ], // load 옵션을 이용해서 나중에 AWS의 환경변수 저장소에서 가져오게 되는 경우도 해결할 수 있음
  controllers: [AppController],
  // process.env를 사용할 것이 아닌 configServicew를 이용해서 환경변수를 가져온다.
  providers: [AppService, ConfigService, UsersService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddlware).forRoutes('*');
  }
}
