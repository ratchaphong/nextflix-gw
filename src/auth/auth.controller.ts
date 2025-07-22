// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  HttpCode,
  UseGuards,
  Patch,
  Delete,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { LoginResponseDto } from './dto/login-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { InviteDto } from './dto/invite.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Allows a new user to register using email, password, and name. Returns confirmation with user ID.',
  })
  @ApiCreatedResponse({ type: RegisterResponseDto })
  @ApiConflictResponse({
    description: 'Email already used',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email already used',
        error: 'Conflict',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'email must be an email',
          'password must be longer than or equal to 6 characters',
        ],
        error: 'Bad Request',
      },
    },
  })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    const result = await this.authService.register(dto);
    return plainToInstance(RegisterResponseDto, result);
  }

  @Post('login')
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates user credentials and returns an access token on success.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'password should not be empty'],
        error: 'Bad Request',
      },
    },
  })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const result = await this.authService.login(dto);
    return plainToInstance(LoginResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile (requires token)' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 400,
        message: 'User not found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'No or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  async profile(@Req() req: any): Promise<ProfileResponseDto> {
    const result = await this.authService.getProfile(req.user.sub);
    return plainToInstance(ProfileResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me')
  @ApiOperation({
    summary: 'Update user profile',
    description:
      'Allows the authenticated user to update their profile. Requires Bearer Token.',
  })
  @ApiOkResponse({ type: ProfileResponseDto, description: 'User updated' })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 400,
        message: 'User not found',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'No or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  async updateMe(
    @Req() req,
    @Body() dto: UpdateUserDto,
  ): Promise<ProfileResponseDto> {
    const result = await this.authService.updateUser(req.user.sub, dto);
    return plainToInstance(ProfileResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID (for testing)' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'uuid-here' })
  @ApiOkResponse({ description: 'User deleted successfully' })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 400,
        message: 'User not found',
      },
    },
  })
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.authService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }

  @Post('access-token')
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Issue new access token only if it is about to expire',
  })
  async getAccessToken(@Req() req: Request): Promise<LoginResponseDto> {
    const authHeader = req.headers['authorization']; // ✅ lowercase (always lowercase in Express)

    console.log('authHeader =', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('token =', token);

    const result = await this.authService.issueNewAccessToken(token);
    return plainToInstance(LoginResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('invite')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Invite a member to join household',
    description:
      'Allows OWNER to invite a MEMBER to their household. Creates user, member, and default profile.',
  })
  @ApiCreatedResponse({ type: RegisterResponseDto })
  @ApiConflictResponse({
    description: 'Email already used',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email already used',
        error: 'Conflict',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'name should not be empty'],
        error: 'Bad Request',
      },
    },
  })
  async invite(
    @Req() req,
    @Body() dto: InviteDto,
  ): Promise<RegisterResponseDto> {
    const result = await this.authService.invite(req.user.sub, dto);
    return plainToInstance(RegisterResponseDto, result);
  }
}
