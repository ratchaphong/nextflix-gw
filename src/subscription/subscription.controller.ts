import { Controller, Get, Param } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { SubscriptionPackageDto } from './dto/sub-scription-package.dto';

@ApiTags('Subscription Packages')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subscription packages' })
  @ApiOkResponse({ type: [SubscriptionPackageDto] })
  async findAll() {
    const packages = await this.subscriptionService.findAll();
    return plainToInstance(SubscriptionPackageDto, packages, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription package by ID' })
  @ApiOkResponse({ type: SubscriptionPackageDto })
  async findOne(@Param('id') id: string) {
    const pkg = await this.subscriptionService.findById(id);
    return plainToInstance(SubscriptionPackageDto, pkg, {
      excludeExtraneousValues: true,
    });
  }
}
