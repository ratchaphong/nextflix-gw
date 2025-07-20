// src/auth/auth.service.ts
import {
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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private subscriptionService: SubscriptionService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already used');
    const defaultPackageId =
      await this.subscriptionService.getDefaultPackageId();

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashed,
        role: Role.OWNER,
        profiles: {
          create: {
            name: dto.name,
          },
        },
        subscriptionPackageId: defaultPackageId,
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
        subscriptionPackage: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const profiles = await this.prisma.profile.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      ...user,
      package: user.subscriptionPackage,
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
}
