import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    required: true,
    example: 1,
    description: '아이디',
  })
  id: number;

  @ApiProperty({
    required: true,
    example: 1,
    description: '아이디',
  })
  email: string;

  @ApiProperty({
    required: true,
    example: 1,
    description: '아이디',
  })
  password: string;
}
