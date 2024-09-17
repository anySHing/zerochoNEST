import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { ChannelMembers } from 'src/entities/ChannelMembers';

class MockUserRepository {
  #data = [{ id: 1, email: 'zeroch0@gmail.com' }];

  findOne({ where: { email } }: { where: { email: string } }) {
    const data = this.#data.find((v) => v.email === email);

    if (data) {
      return data;
    }
    return null;
  }
}

class MockWorkspaceMembersRepository {}
class MockChannelMembersRepository {}

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Users),
          useClass: MockUserRepository,
        },
        {
          provide: getRepositoryToken(WorkspaceMembers),
          useClass: MockWorkspaceMembersRepository,
        },
        {
          provide: getRepositoryToken(ChannelMembers),
          useClass: MockChannelMembersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findByEmail은 이메일을 통해 유저를 찾아야 함', () => {
    expect(service.findByEmail('zeroch0@gmail.com')).resolves.toStrictEqual({
      email: 'zeroch0@gmail.com',
      id: 1,
    });
  });

  it('findByEmail은 유저를 못 찾으면 null을 반환해야 함', () => {
    expect(service.findByEmail('zeroch0@gmail.com')).resolves.toBe(null);
  });
});
