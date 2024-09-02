import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DmsService } from './dms.service';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

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
  getChat(@Query('perPage') perPage, @Query('page') page) {
    console.log(perPage, page);
  }

  @Post(':id/chats')
  postChat(@Body() body) {}
}
