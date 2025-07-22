// src/auth/auth.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';
import { JwtPayload } from '../jwt/jwt-payload';
import { NEAR_EXPIRY_THRESHOLD_SECONDS } from '../utils/auth.utils';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { LoginLogService } from 'src/login-log/login-log.service';
import { InviteDto } from './dto/invite.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private subscriptionService: SubscriptionService,
    private loginLogService: LoginLogService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already used');

    const defaultPackageId =
      await this.subscriptionService.getDefaultPackageId();

    const hashed = await bcrypt.hash(dto.password, 10);

    // 1. สร้าง user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashed,
        role: Role.OWNER,
        subscriptionPackageId: defaultPackageId,
      },
    });

    // 2. สร้าง household
    const household = await this.prisma.household.create({
      data: {
        name: `${dto.name}'s Household`,
        userId: user.id,
      },
    });

    // ✅ 3. สร้าง householdMember (default) + เชื่อม userId
    const member = await this.prisma.householdMember.create({
      data: {
        name: dto.name,
        householdId: household.id,
        userId: user.id,
      },
    });

    // 4. สร้าง profile เชื่อมกับ householdMember
    await this.prisma.profile.create({
      data: {
        name: dto.name,
        householdMemberId: member.id,
      },
    });

    return { message: 'Register success', userId: user.id };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    await this.loginLogService.create({
      userId: user.id,
    });

    const token = this.jwtService.sign({ sub: user.id, role: user.role });

    return { accessToken: token };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        household: {
          include: { members: true },
        },
        member: {
          include: {
            household: {
              include: {
                members: true,
                user: { include: { subscriptionPackage: true } },
              },
            },
          },
        },
        subscriptionPackage: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // ✅ หา household จาก OWNER หรือ MEMBER
    const household = user.household ?? user.member?.household;
    if (!household) throw new NotFoundException('Household not found');

    // ✅ หา package จาก OWNER (กรณี MEMBER จะเป็นของ user เจ้าของ household)
    const subscriptionPackage =
      user.role === Role.OWNER
        ? user.subscriptionPackage
        : user.member?.household?.user.subscriptionPackage;

    const memberIds = household.members.map((m) => m.id);

    const profiles = await this.prisma.profile.findMany({
      where: {
        householdMemberId: {
          in: memberIds,
        },
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      household,
      package: subscriptionPackage,
      profiles,
    };
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    await this.getProfile(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  async deleteUser(id: string): Promise<void> {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id } });
  }

  async issueNewAccessToken(oldAccessToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(oldAccessToken);
    } catch (err) {
      throw new UnauthorizedException('Token expired or invalid');
    }

    const decoded: JwtPayload = this.jwtService.decode(oldAccessToken);
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiresInSeconds = decoded.exp || 0;

    const timeRemaining = expiresInSeconds - nowInSeconds;

    // console.log('🕒 DEBUG TOKEN TIMING:');
    // console.log('🔸 Now (epoch):', nowInSeconds);
    // console.log('🔸 Token Exp (epoch):', expiresInSeconds);
    // console.log('🔸 Time remaining (sec):', timeRemaining);
    // console.log('🔸 Threshold (sec):', NEAR_EXPIRY_THRESHOLD_SECONDS);

    if (timeRemaining > NEAR_EXPIRY_THRESHOLD_SECONDS) {
      console.log('❌ Token is NOT near expiry.');
      throw new UnauthorizedException('Token not near expiry');
    }

    // console.log('✅ Token is near expiry. Proceed to issue new token.');

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const newAccessToken = this.jwtService.sign({
      sub: user.id,
      role: user.role,
    });

    return { accessToken: newAccessToken };
  }

  async invite(ownerId: string, dto: InviteDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already used');

    const hashed = await bcrypt.hash(dto.password, 10);

    const household = await this.prisma.household.findUnique({
      where: { userId: ownerId },
    });
    if (!household) throw new NotFoundException('Household not found');

    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      include: { subscriptionPackage: true },
    });

    const memberCount = await this.prisma.householdMember.count({
      where: { householdId: household.id },
    });

    const maxMembers = owner?.subscriptionPackage?.maxMembers ?? 4;
    if (memberCount >= maxMembers) {
      throw new BadRequestException('Cannot add more household members');
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashed,
        role: Role.MEMBER,
      },
    });

    const member = await this.prisma.householdMember.create({
      data: {
        name: dto.name,
        householdId: household.id,
        userId: user.id,
      },
    });

    await this.prisma.profile.create({
      data: {
        name: dto.name,
        householdMemberId: member.id,
      },
    });

    return {
      message: 'Invite successful',
      userId: user.id,
    };
  }
}
