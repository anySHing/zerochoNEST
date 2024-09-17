import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { Users } from 'src/entities/Users';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { Workspaces } from 'src/entities/Workspaces';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class WorkspacesService {
  deleteWorkspaceMembers(url: any, id: any) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Workspaces)
    private workspacesRepository: Repository<Workspaces>,
    @InjectRepository(Channels)
    private channelsRepository: Repository<Channels>,
    @InjectRepository(WorkspaceMembers)
    private workspaceMembersRepository: Repository<WorkspaceMembers>,
    @InjectRepository(ChannelMembers)
    private channelMembersRepository: Repository<ChannelMembers>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private dataSource: DataSource,
  ) {}

  async findById(id: number) {
    return this.workspacesRepository.findOne({ where: { id } });
  }

  async findMyWorkspaces(myId: number) {
    return this.workspacesRepository.find({
      where: {
        WorkspaceMembers: [{ UserId: myId }],
      },
    });
  }

  async createWorkspace(name: string, url: string, myId: number) {
    /*
    const workspace = new Workspaces();

    workspace.name = name;
    workspace.url = url;
    workspace.OwnerId = myId;
    */

    const workspace = this.workspacesRepository.create({
      name,
      url,
      OwnerId: myId,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const returned = await queryRunner.manager
        .getRepository(Workspaces)
        .save(workspace);

      const workspaceMember = new WorkspaceMembers();

      workspaceMember.UserId = myId;
      workspaceMember.WorkspaceId = returned.id;

      await queryRunner.manager
        .getRepository(WorkspaceMembers)
        .save(workspaceMember);

      const channel = new Channels();

      channel.name = '일반';
      channel.WorkspaceId = returned.id;

      const channelReturned = await queryRunner.manager
        .getRepository(Channels)
        .save(channel);

      const channelMember = new ChannelMembers();

      channelMember.UserId = myId;
      channelMember.ChannelId = channelReturned.id;

      await queryRunner.manager
        .getRepository(ChannelMembers)
        .save(channelMember);
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getWorkspaceMembers(url: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.WorkspaceMembers', 'members')
      .innerJoin('members.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .getMany();
  }

  async createWorkspaceMembers(
    url: string,
    email: string,
  ): Promise<Users | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    queryRunner.connect();
    queryRunner.startTransaction();

    const workspace = await this.workspacesRepository.findOne({
      where: { url },
      join: {
        alias: 'workspace',
        innerJoinAndSelect: {
          channels: 'workspace.Channels',
        },
      },
    });

    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    const workspaceMember = new WorkspaceMembers();

    workspaceMember.WorkspaceId = workspace.id;
    workspaceMember.UserId = user.id;

    try {
      await queryRunner.manager
        .getRepository(WorkspaceMembers)
        .save(workspaceMember);

      const channelMember = new ChannelMembers();

      channelMember.ChannelId = workspace.Channels.find(
        (v) => v.name === '일반',
      ).id;
      channelMember.UserId = user.id;

      await queryRunner.manager
        .getRepository(ChannelMembers)
        .save(channelMember);
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getWorkspaceMember(url: string, id: number) {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .innerJoin('user.Workspaces', 'workspaces', 'workspaces.url', { url })
      .getOne();
  }
}
