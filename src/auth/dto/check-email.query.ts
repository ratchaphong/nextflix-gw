import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CheckEmailQuery {
  @ApiProperty({
    description: 'Email to check',
    example: 'ratchaphongc1@gmail.com',
  })
  @IsEmail()
  email: string;
}
