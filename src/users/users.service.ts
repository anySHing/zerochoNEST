import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users';
import { DataSource, Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { ChannelMembers } from 'src/entities/ChannelMembers';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private dataSource: DataSource,
  ) {}

  async findByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return user;
  }

  async join(email: string, nickname: string, password: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const user = await queryRunner.manager
      .getRepository(Users)
      .findOne({ where: { email } });

    if (user) {
      throw new NotFoundException('이미 존재하는 사용자입니다.');
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      const returned = await queryRunner.manager.getRepository(Users).save({
        email,
        nickname,
        password: hashedPassword,
      });

      const workspaceMember = queryRunner.manager
        .getRepository(WorkspaceMembers)
        .create();

      workspaceMember.UserId = returned.id;
      workspaceMember.WorkspaceId = 1;

      await queryRunner.manager
        .getRepository(WorkspaceMembers)
        .save(workspaceMember);

      await queryRunner.manager.getRepository(ChannelMembers).save({
        UserId: returned.id,
        ChannelId: 1,
      });

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
