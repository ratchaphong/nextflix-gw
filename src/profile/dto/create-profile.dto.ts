import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({ example: 'Alice' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
