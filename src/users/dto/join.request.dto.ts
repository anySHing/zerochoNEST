import { PickType } from '@nestjs/swagger';
import { Users } from 'src/entities/Users';

export class JoinRequestDto extends PickType(Users, [
  'email',
  'nickname',
  'password',
] as const) {
  /* @ApiProperty({
    example: 'pshysd@kakao.com',
    description: '이메일',
    required: true,
  })
  public email: string;

  @ApiProperty({
    example: 'PSH',
    description: '닉네임',
    required: true,
  })
  public nickname: string;

  @ApiProperty({
    example: '1234',
    description: '비밀번호',
    required: true,
  })
  public password: string; */
}
