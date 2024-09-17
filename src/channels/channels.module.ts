import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users';
import { Channels } from 'src/entities/Channels';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { ChannelChats } from 'src/entities/ChannelChats';
import { EventsModule } from 'src/events/events.module';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';
import path from 'path';
import { Workspaces } from 'src/entities/Workspaces';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Channels,
      ChannelMembers,
      ChannelChats,
      Users,
      Workspaces,
    ]),
    EventsModule,
    MulterModule.register({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService],
})
export class ChannelsModule {}
