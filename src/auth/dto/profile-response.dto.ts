import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class ProfileItem {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

export class Household {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;
}

export class ProfileResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
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
}
