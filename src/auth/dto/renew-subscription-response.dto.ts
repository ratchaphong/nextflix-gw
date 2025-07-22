import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RenewSubscriptionResponseDto {
  @ApiProperty({ example: '2025-08-22T00:00:00.000Z' })
  @Expose()
  packageExpiredAt: Date;
}
