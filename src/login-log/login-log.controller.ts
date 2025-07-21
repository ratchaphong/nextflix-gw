import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LoginLogService } from './login-log.service';
import { CreateLoginLogDto } from './dto/create-login-log.dto';
import {
  ApiOperation,
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { LoginLogResponseDto } from './dto/login-log-response.dto';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';

@ApiTags('Login Log')
@Controller('login-log')
export class LoginLogController {
  constructor(private readonly service: LoginLogService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create login log' })
  @ApiOkResponse({
    type: LoginLogResponseDto,
    description: 'Log created successfully',
  })
  async create(@Body() dto: CreateLoginLogDto, @Req() req) {
    const userId = req.user.sub;
    const result = await this.service.create({ ...dto, userId });
    return plainToInstance(LoginLogResponseDto, result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all login logs' })
  @ApiOkResponse({ type: [LoginLogResponseDto], description: 'List of logs' })
  async findAll() {
    const result = await this.service.findAll();
    return plainToInstance(LoginLogResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
