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
import {
  CACHE_TTL_SECONDS,
  NEAR_EXPIRY_THRESHOLD_SECONDS,
  THIRTY_DAYS,
} from '../utils/auth.utils';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { LoginLogService } from 'src/login-log/login-log.service';
import { InviteDto } from './dto/invite.dto';
import { CheckEmailQuery } from './dto/check-email.query';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private subscriptionService: SubscriptionService,
    private loginLogService: LoginLogService,
    private readonly cacheService: CacheService,
  ) {}

  // async checkEmail(dto: CheckEmailQuery) {
  //   try {
  //     await this.prisma.user.findUniqueOrThrow({
  //       where: { email: dto.email },
  //     });

  //     return { exists: true };
  //   } catch {
  //     throw new NotFoundException('Email not found');
  //   }
  // }
  async checkEmail(dto: CheckEmailQuery) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (user) {
      throw new ConflictException('Email already exists');
    }

    return { isAvailable: true };
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already used');

    const defaultPackageId =
      await this.subscriptionService.getDefaultPackageId();

    const hashed = await bcrypt.hash(dto.password, 10);

    // 1. สร้าง user
    const now = new Date();
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashed,
        role: Role.OWNER,
        subscriptionPackageId: defaultPackageId,
        packageExpiredAt: new Date(now.getTime() + THIRTY_DAYS),
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

    if (user.packageExpiredAt && user.packageExpiredAt < new Date()) {
      throw new UnauthorizedException('Invalid credentials or expired package');
    }

    // await this.loginLogService.create({}, user.id);
    this.loginLogService.createInBackground({}, user.id);

    const token = this.jwtService.sign({ sub: user.id, role: user.role });

    return { accessToken: token };
  }

  async getProfile(userId: string) {
    const cacheKey = `profile:${userId}`;

    const cached = await this.cacheService.get(cacheKey);
    console.log(`[getProfile] CacheKey: ${cacheKey}, Found: ${!!cached}`);

    if (cached) {
      console.log(`[getProfile] 🔄 Returned from cache`);
      // console.log(
      //   '[getProfile] Cached Value:',
      //   JSON.stringify(cached, null, 2),
      // );

      return cached;
    }

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

    if (!user) {
      console.warn(`[getProfile] ❌ User not found`);
      throw new NotFoundException('User not found');
    }

    // ✅ หา household จาก OWNER หรือ MEMBER
    const household = user.household ?? user.member?.household;
    if (!household) {
      console.warn(`[getProfile] ❌ Household not found`);
      throw new NotFoundException('Household not found');
    }

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

    const result = {
      ...user,
      household,
      package: subscriptionPackage,
      profiles,
    };

    await this.cacheService.set(cacheKey, result, CACHE_TTL_SECONDS);
    console.log(
      `[getProfile] ✅ Set cache for profile:${userId} for ${CACHE_TTL_SECONDS / 1000} seconds`,
    );

    return result;
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    await this.cacheService.del(`profile:${userId}`);
    console.log(`[updateUser] 🧹 Deleted cache: profile:${userId}`);

    return updatedUser;
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

  async renewSubscription(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const now = new Date();

    const currentExpiry = user.packageExpiredAt;
    const newExpiry =
      currentExpiry && currentExpiry > now
        ? new Date(currentExpiry.getTime() + THIRTY_DAYS)
        : new Date(now.getTime() + THIRTY_DAYS);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { packageExpiredAt: newExpiry },
    });

    return { packageExpiredAt: updatedUser.packageExpiredAt };
  }
}
