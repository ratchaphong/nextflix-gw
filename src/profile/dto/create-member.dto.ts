// src/household/dto/create-member.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({ example: 'Alice' })
  @IsNotEmpty()
  name: string;
}
