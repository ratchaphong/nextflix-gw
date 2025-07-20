import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class ProfileItem {
  @ApiProperty({ example: 'profile-uuid-1234' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'John' })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL profile image',
  })
  @Expose()
  image?: string;

  @ApiProperty({ example: 'user-uuid-5678' })
  @Expose()
  userId: string;

  @ApiProperty({ example: '2025-07-17T12:34:56.789Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2025-07-17T12:34:56.789Z' })
  @Expose()
  updatedAt: Date;
}

export class Household {
  @ApiProperty({ example: 'household-uuid-9999' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Smith Family' })
  @Expose()
  name: string;
}

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

export class ProfileResponseDto {
  @ApiProperty({ example: 'user-uuid-5678' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'john@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'John Smith' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'OWNER' })
  @Expose()
  role: Role;

  @ApiProperty({ type: [ProfileItem] })
  @Expose()
  @Type(() => ProfileItem)
  profiles: ProfileItem[];

  @ApiProperty({ type: Household, nullable: true })
  @Expose()
  @Type(() => Household)
  household: Household | null;

  @ApiProperty({ type: SubscriptionPackageDto })
  @Expose()
  @Type(() => SubscriptionPackageDto)
  package: SubscriptionPackageDto;
}
