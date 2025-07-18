import {
  UseGuards,
  Controller,
  Post,
  Req,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ProfileItem } from 'src/auth/dto/profile-response.dto';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Profiles')
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @ApiOperation({ summary: 'Create new profile (max 4 per user)' })
  @ApiCreatedResponse({
    description: 'Profile created successfully',
    type: ProfileItem,
  })
  @ApiBadRequestResponse({
    description: 'Maximum of 4 profiles reached or invalid data',
    schema: {
      example: {
        statusCode: 400,
        message: 'Cannot create more than 4 profiles',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'No or invalid token provided',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  async create(@Req() req, @Body() dto: CreateProfileDto) {
    const profile = await this.profileService.createProfile(req.user.sub, dto);
    return plainToInstance(ProfileItem, profile, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update profile by ID' })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    type: ProfileItem,
  })
  @ApiNotFoundResponse({
    description: 'Profile not found or does not belong to user',
    schema: {
      example: {
        statusCode: 404,
        message: 'Profile not found',
        error: 'Not Found',
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
  async update(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: UpdateProfileDto,
  ) {
    const profile = await this.profileService.updateProfile(
      id,
      req.user.sub,
      dto,
    );
    return plainToInstance(ProfileItem, profile, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete profile by ID (cannot delete the first profile)',
  })
  @ApiOkResponse({
    description: 'Profile soft deleted successfully',
    type: ProfileItem,
  })
  @ApiBadRequestResponse({
    description: 'Cannot delete the first profile or only profile',
    schema: {
      example: {
        statusCode: 400,
        message: 'Cannot delete the first profile',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Profile not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Profile not found',
        error: 'Not Found',
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
  async delete(@Param('id') id: string, @Req() req) {
    const profile = await this.profileService.deleteProfile(id, req.user.sub);
    return plainToInstance(ProfileItem, profile, {
      excludeExtraneousValues: true,
    });
  }
}
