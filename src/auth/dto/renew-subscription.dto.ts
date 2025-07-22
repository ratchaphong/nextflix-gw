import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RenewSubscriptionDto {
  @ApiProperty({ example: 'uuid-of-user' })
  @IsUUID()
  userId: string;
}
