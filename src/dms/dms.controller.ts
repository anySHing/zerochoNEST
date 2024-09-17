import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DmsService } from './dms.service';
import { ApiParam, ApiQuery } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { Users } from 'src/entities/Users';

@ApiParam({
  name: 'url',
  required: true,
  description: '워크스페이스 url',
})
@Controller('api/workspaces/:url/dms')
export class DmsController {
  constructor(private dmsService: DmsService) {}

  @ApiQuery({
    name: 'perPage',
    required: true,
    description: '한 번에 가져오는 갯수',
  })
  @ApiQuery({
    name: 'page',
    required: true,
    description: '불러올 페이지',
  })
  @Get(':id/chats')
  getChat(@Query('perPage') perPage: number, @Query('page') page: number) {
    console.log(perPage, page);
  }

  @Post(':id/chats')
  async createWorkspaceDMChats(
    @Param('url') url: string,
    @Param('id') id: number,
    @Body('content') content: any,
    @User() user: Users,
  ) {
    return this.dmsService.createWorkspaceDMChats(url, content, id, user.id);
  }
}
