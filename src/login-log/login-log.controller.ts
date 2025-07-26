import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
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
import { PdfService } from 'src/pdf/pdf.service';
import { Response } from 'express';
import { FileDownloadResponseDto } from './dto/file-download-response.dto';

@ApiTags('Login Log')
@Controller('login-log')
export class LoginLogController {
  constructor(
    private readonly service: LoginLogService,
    private readonly pdfService: PdfService,
  ) {}

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
    const result = await this.service.create(dto, userId);
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me/daily')
  @ApiOperation({ summary: "Get today's login logs for current user" })
  @ApiOkResponse({ type: [LoginLogResponseDto] })
  async getMyDaily(@Req() req) {
    const userId = req.user.sub;
    const result = await this.service.findMyDailyLogs(userId);
    return plainToInstance(LoginLogResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me/monthly')
  @ApiOperation({ summary: "Get current user's login logs in this month" })
  @ApiOkResponse({ type: [LoginLogResponseDto] })
  async getMyMonthly(@Req() req) {
    const userId = req.user.sub;
    const result = await this.service.findMyMonthlyLogs(userId);
    return plainToInstance(LoginLogResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get('daily')
  @ApiOperation({ summary: "Get today's login logs for all users" })
  @ApiOkResponse({ type: [LoginLogResponseDto] })
  async getAllDaily() {
    const result = await this.service.findAllDailyLogs();
    return plainToInstance(LoginLogResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get('monthly')
  @ApiOperation({ summary: "Get all users' login logs in this month" })
  @ApiOkResponse({ type: [LoginLogResponseDto] })
  async getAllMonthly() {
    const result = await this.service.findAllMonthlyLogs();
    return plainToInstance(LoginLogResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('report/daily/pdf')
  @ApiOperation({ summary: 'Download daily login report as PDF' })
  @ApiOkResponse({
    description: 'PDF file containing daily login logs',
    type: FileDownloadResponseDto,
  })
  async downloadPdf(@Res() res: Response) {
    const result = await this.service.findAllDailyLogs();
    const logs = plainToInstance(LoginLogResponseDto, result, {
      excludeExtraneousValues: true,
    });
    const buffer = await this.pdfService.generateLoginLogPdf({ logs });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="login-log.pdf"',
    });
    res.end(buffer);
  }
}
