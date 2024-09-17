import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { User } from '../common/decorators/user.decorator';
import { Users } from 'src/entities/Users';
import { ApiOperation } from '@nestjs/swagger';
import { CreateWorkspaceDto } from './create-workspace.dto';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly WorkspacesService: WorkspacesService) {}
  @Get()
  getMyWorkspaces(@User() user: Users) {
    return this.WorkspacesService.findMyWorkspaces(user.id);
  }

  @ApiOperation({
    summary: '워크스페이스 생성',
  })
  @Post()
  createWorkspace(@User() user: Users, @Body() body: CreateWorkspaceDto) {
    return this.WorkspacesService.createWorkspace(body.name, body.url, user.id);
  }

  @ApiOperation({
    summary: '워크스페이스 멤버 가져오기',
  })
  @Get(':url/members')
  getAllMembersFromWorkspace(@Param('url') url: string) {
    return this.WorkspacesService.getWorkspaceMembers(url);
  }

  @ApiOperation({
    summary: '워크스페이스에 유저 초대하기',
  })
  @Post(':url/members')
  inviteMembersToWorkspace(
    @Param('url') url: string,
    @Body('email') email: string,
  ) {
    return this.WorkspacesService.createWorkspaceMembers(url, email);
  }

  @ApiOperation({
    summary: '워크스페이스 유저 추방하기',
  })
  @Delete(':url/members/:id')
  kickMemberFromWorkspace(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.WorkspacesService.deleteWorkspaceMembers(url, id);
  }

  @ApiOperation({
    summary: '워크스페이스 특정 멤버 정보 가져오기',
  })
  @Get(':url/members/:id')
  getMemberInfoWorkspace(
    @Param('url') url: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.WorkspacesService.getWorkspaceMember(url, id);
  }
}
