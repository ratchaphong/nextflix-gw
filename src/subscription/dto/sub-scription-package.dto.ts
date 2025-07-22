import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SubscriptionPackageDto {
  @ApiProperty({ example: 'basic-id' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Basic' })
  @Expose()
  name: string;

  @ApiProperty({ example: 1 })
  @Expose()
  maxProfiles: number;

  @ApiProperty({ example: 1 })
  @Expose()
  maxMembers: number;

  @ApiProperty({ example: 0 })
  @Expose()
  price: number;

  @ApiProperty({ example: '480p' })
  @Expose()
  resolution: string;
}
