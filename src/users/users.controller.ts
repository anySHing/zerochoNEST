import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  Res,
  ForbiddenException,
} from '@nestjs/common';
import { JoinRequestDto } from './dto/join.request.dto';
import { UsersService } from './users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDto } from 'src/common/dto/user.dto';
import { User } from 'src/common/decorators/user.decorator';
import { UndefinedToNullInterceptor } from 'src/common/interceptors/undefinedToNull.interceptor';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { Users } from 'src/entities/Users';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { Response } from 'express';
import { NotLoggedInGuard } from 'src/auth/not-logged-in.guard';
import { ForbiddenTransactionModeOverrideError } from 'typeorm';

// /users
@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('USER')
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiResponse({
    status: 200,
    description: '성공',
    type: UserDto,
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @ApiOperation({ summary: '내 정보 조회' })
  @Get()
  getProfile(@User() user: Users) {
    return user || false;
  }

  @ApiOperation({ summary: '회원가입' })
  @UseGuards(NotLoggedInGuard)
  @Post()
  async join(@Body() data: JoinRequestDto) {
    const result = await this.usersService.join(
      data.email,
      data.nickname,
      data.password,
    );

    if (!result) {
      throw new ForbiddenException();
    }

    return 'ok';
  }

  // users/login
  @ApiResponse({
    // apiOkResponse 하면 status 생략 가능함
    status: 200,
    description: '로그인 성공',
    type: UserDto,
  })
  @ApiOperation({ summary: '로그인' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@User() user: Users) {
    return user;
  }

  // users/logout
  @ApiOperation({ summary: '로그아웃' })
  @Post('logout')
  @UseGuards(LoggedInGuard)
  logOut(@Res() res: Response) {
    res.clearCookie('connect.sid', { httpOnly: true });
    return res.send('ok');
  }
}
