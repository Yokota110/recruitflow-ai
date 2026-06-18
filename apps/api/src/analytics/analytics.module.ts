import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { CrmModule } from '../crm/crm.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [CrmModule, WorkflowsModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
