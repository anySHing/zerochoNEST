import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import dataSource from 'dataSource';
import { ChannelChats } from 'src/entities/ChannelChats';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { Users } from 'src/entities/Users';
import { Workspaces } from 'src/entities/Workspaces';
import { EventsGateway } from 'src/events/events.gateway';
import { DataSource, MoreThan, Repository } from 'typeorm';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channels)
    private readonly channelsRepository: Repository<Channels>,
    @InjectRepository(ChannelMembers)
    private readonly channelMembersRepository: Repository<ChannelMembers>,
    @InjectRepository(Workspaces)
    private readonly workspacesRepository: Repository<Workspaces>,
    @InjectRepository(ChannelChats)
    private readonly channelChatsRepository: Repository<ChannelChats>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private dateSource: DataSource,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async findById(id: number) {
    return this.channelsRepository.findOne({ where: { id } });
  }

  async getWorkspaceChannels(url: string, myId: number) {
    return this.channelsRepository
      .createQueryBuilder('channels')
      .innerJoinAndSelect(
        'channels.ChannelMembers',
        'channelMembers',
        'channelMembers.userId = :myId',
        { myId },
      )
      .innerJoinAndSelect(
        'channels.Workspace',
        'workspace',
        'workspace.url = :url',
        { url },
      )
      .getMany();
  }

  async getWorkspaceChannel(url: string, name: string) {
    return this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();
  }

  async createWorkspaceChannelChats(
    url: string,
    name: string,
    content: string,
    myId: number,
  ) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();

    if (!channel) {
      throw new NotFoundException('존재하지 않는 채널입니다.');
    }

    const chats = this.channelChatsRepository.create({
      content,
      UserId: myId,
      ChannelId: channel.id,
    });

    const savedChat = await this.channelChatsRepository.save(chats);

    const chatWithUser = await this.channelChatsRepository.findOne({
      where: { id: savedChat.id },
      relations: ['User', 'Channel'],
    });
    this.eventsGateway.server
      .to(`/ws-${url}-${chatWithUser.ChannelId}`)
      .emit(`message ${chatWithUser}`);
  }

  getWorkspaceChannelChats(
    url: string,
    name: string,
    perPage: number,
    page: number,
  ) {
    return this.channelChatsRepository
      .createQueryBuilder('channelChats')
      .innerJoin('channelChats.Channel', 'channel', 'channel.name = :name', {
        name,
      })
      .innerJoin('channelChats.User', 'user')
      .orderBy('channelChats.createdAt', 'DESC')
      .take(perPage)
      .skip(perPage * (page - 1))
      .getMany();
  }

  async createWorkspaceChannelImages(
    url: string,
    name: string,
    files: Express.Multer.File[],
    myId: number,
  ) {
    console.log(files);

    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspace', 'workspace', 'workspace.url =:url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();

    for (let i = 0; i < files.length; i++) {
      const chats = new ChannelChats();

      chats.content = files[i].path;
      chats.UserId = myId;
      chats.ChannelId = channel.id;

      const savedChat = await this.channelChatsRepository.save(chats);
      const chatWithUser = await this.channelChatsRepository.findOne({
        where: { id: savedChat.id },
        relations: ['User', 'Channel'],
      });
      this.eventsGateway.server
        .to(`/ws-${url}-${chatWithUser.ChannelId}`)
        .emit(`message ${chatWithUser}`);
    }
  }

  async getChannelUnreadsCount(url: string, name: string, after: number) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspace', 'workspace', 'workspace.url =:url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();

    return this.channelChatsRepository.count({
      where: {
        ChannelId: channel.id,
        createdAt: MoreThan(new Date(after)),
      },
    });
  }

  async getWorkspaceChannelMembers(url: string, name: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.Channels', 'channels', 'channels.name = :name', { name })
      .innerJoin('channels.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .getMany();
  }

  async createWorkspaceChannelMembers(
    url: string,
    name: string,
    email: string,
  ) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();

    if (!channel) {
      throw new NotFoundException('존재하지 않는 워크스페이스');
    }

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.WOrkspaces', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('접근 권한이 없습니다.');
    }

    const channelMember = this.channelMembersRepository.create({
      ChannelId: channel.id,
      UserId: user.id,
    });

    await this.channelMembersRepository.save(channelMember);
  }

  async createWorkspaceChannels(url: string, name: string, id: number) {
    const workspace = await this.workspacesRepository.findOne({
      where: { url },
    });

    if (!workspace) {
      throw new NotFoundException('존재하지 않는 워크스페이스입니다.');
    }

    const channel = this.channelsRepository.create({
      name,
      WorkspaceId: workspace.id,
    });

    const queryRunner = dataSource.createQueryRunner();

    queryRunner.connect();

    queryRunner.startTransaction();

    try {
      await queryRunner.manager.getRepository(Channels).save(channel);

      const channelMember = this.channelMembersRepository.create({
        UserId: id,
        ChannelId: channel.id,
      });

      await queryRunner.manager
        .getRepository(ChannelMembers)
        .save(channelMember);
    } catch (error) {
      console.error(error);
      queryRunner.rollbackTransaction();
    } finally {
      queryRunner.release();
    }
  }
}
