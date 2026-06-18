import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../common/decorators/auth.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.analyticsService.getDashboard(orgId, userId);
  }

  @Get('funnel')
  getFunnel(
    @CurrentUser('organizationId') orgId: string,
    @Query('jobId') jobId?: string,
  ) {
    return this.analyticsService.getFunnel(orgId, jobId);
  }

  @Get('sources')
  getSources(@CurrentUser('organizationId') orgId: string) {
    return this.analyticsService.getSourcePerformance(orgId);
  }

  @Get('conversion')
  getConversion(@CurrentUser('organizationId') orgId: string) {
    return this.analyticsService.getConversionRates(orgId);
  }

  @Get('offers')
  getOffers(@CurrentUser('organizationId') orgId: string) {
    return this.analyticsService.getOfferMetrics(orgId);
  }

  @Get('recruiters')
  getRecruiters(@CurrentUser('organizationId') orgId: string) {
    return this.analyticsService.getRecruiterPerformance(orgId);
  }

  @Get('velocity')
  getVelocity(@CurrentUser('organizationId') orgId: string) {
    return this.analyticsService.getVelocity(orgId);
  }
}
