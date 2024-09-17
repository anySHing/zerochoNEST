import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { User } from 'src/common/decorators/user.decorator';
import { Users } from 'src/entities/Users';
import { CreateChannelDto } from './dto/create-channel.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('CHANNELS')
@ApiCookieAuth('conntect.sid')
@UseGuards(LoggedInGuard)
@Controller('api/workspaces')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @ApiOperation({ summary: '워크스페이스 채널 모두 가져오기' })
  @Get(':url/channels')
  async getWorkspaceChannels(@Param('url') url: string, @User() user: Users) {
    return this.channelsService.getWorkspaceChannels(url, user.id);
  }

  @ApiOperation({ summary: '워크스페이스 특정 채널 가져오기' })
  @Get(':url/channels/:name')
  async getWorkspaceChannel(
    @Param('url') url: string,
    @Param('name') name: string,
  ) {
    return this.channelsService.getWorkspaceChannel(url, name);
  }

  @ApiOperation({ summary: '워크스페이스 채널 만들기' })
  @Post(':url/channels/:name/members')
  async createWorkspaceChannels(
    @Param('url') url: string,
    @Body() body: CreateChannelDto,
    @User() user: Users,
  ) {
    return this.channelsService.createWorkspaceChannels(
      url,
      body.name,
      user.id,
    );
  }

  @ApiOperation({ summary: '워크스페이스 채널 멤버 가져오기' })
  @Get(':url/channels/:name/members')
  async getWorkspaceChannelMembers(
    @Param('url') url: string,
    @Param('name') name: string,
  ) {
    return this.channelsService.getWorkspaceChannelMembers(url, name);
  }

  @ApiOperation({ summary: '워크스페이스 채널 멤버 초대하기' })
  @Post(':url/channels/:name/members')
  async createWorkspaceMembers(
    @Param('url') url: string,
    @Param('name') name: string,
    @Body('email') email: string,
  ) {
    return this.channelsService.createWorkspaceChannelMembers(url, name, email);
  }

  @ApiOperation({ summary: '워크스페이스 특정 채널 채팅 모두 가져오기' })
  @Get(':url/channels/:name/chats')
  async getWorkspaceChannelChats(
    @Param('url') url: string,
    @Param('name') name: string,
    @Query('perPage', ParseIntPipe) perPage: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.channelsService.getWorkspaceChannelChats(
      url,
      name,
      perPage,
      page,
    );
  }

  @ApiOperation({ summary: '워크스페이스 특정 채널 채팅 생성하기' })
  @Post(':/url/channels/:name/chats')
  async createWorkspaceChannelChats(
    @Param('url') url: string,
    @Param('name') name: string,
    @Body('content') content: string,
    @User() user: Users,
  ) {
    return this.channelsService.createWorkspaceChannelChats(
      url,
      name,
      content,
      user.id,
    );
  }

  @ApiOperation({ summary: '워크스페이스 특정 채널 이미지 업로드하기' })
  @UseInterceptors(FilesInterceptor('image', 10))
  @Post(':url/channels/:name/images')
  async createWorkspaceChannelImages(
    @Param() url: string,
    @Param() name: string,
    @UploadedFiles() files: Express.Multer.File[],
    @User() user: Users,
  ) {
    return this.channelsService.createWorkspaceChannelImages(
      url,
      name,
      files,
      user.id,
    );
  }

  @ApiOperation({ summary: '안 읽은 DM 갯수 가져오기' })
  @Get(':url/channels/:name/unreads')
  async getUnreads(
    @Param() url: string,
    @Param() name: string,
    @Query('after', ParseIntPipe) after: number,
  ) {
    return this.channelsService.getChannelUnreadsCount(url, name, after);
  }
}
