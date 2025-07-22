import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { Role } from '@prisma/client';
import { SubscriptionPackageDto } from 'src/subscription/dto/sub-scription-package.dto';

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

  @ApiProperty({ example: 'household-uuid-9999' })
  @Expose()
  householdMemberId: string;

  @ApiProperty({ example: '2025-07-17T12:34:56.789Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2025-07-17T12:34:56.789Z' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    example: ['QYDza3BLr1w', 'NRtnUVaRwXM', 'HegSBovl24I'],
    type: [String],
  })
  @Expose()
  favoriteMovieIds: string[];
}

export class HouseholdMemberDto {
  @ApiProperty({ example: 'member-uuid-1234' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'John' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'user-uuid-5678' })
  @Expose()
  userId: string;
}

export class Household {
  @ApiProperty({ example: 'household-uuid-9999' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Smith Family' })
  @Expose()
  name: string;

  @ApiProperty({ type: [HouseholdMemberDto] })
  @Expose()
  @Type(() => HouseholdMemberDto)
  members: HouseholdMemberDto[];
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

  @ApiProperty({ example: '2025-08-22T00:00:00.000Z' })
  @Expose()
  packageExpiredAt: Date;
}
