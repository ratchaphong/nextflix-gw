import { ApiProperty } from '@nestjs/swagger';

export class CheckEmailResponseDto {
  @ApiProperty({
    description: 'Whether the email already exists',
    example: true,
  })
  isAvailable: boolean;
}
