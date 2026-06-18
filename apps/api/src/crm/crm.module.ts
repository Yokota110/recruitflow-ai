import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { TalentPoolService } from './talent-pool/talent-pool.service';
import { TagsService } from './tags/tags.service';
import { TimelineService } from './timeline/timeline.service';
import { OutreachService } from './outreach/outreach.service';
import { TemplatesService } from './outreach/templates.service';
import { TasksService } from './tasks/tasks.service';
import { SearchService } from './search/search.service';
import { CrmAnalyticsService } from './analytics/crm-analytics.service';

@Module({
  controllers: [CrmController],
  providers: [
    TalentPoolService,
    TagsService,
    TimelineService,
    OutreachService,
    TemplatesService,
    TasksService,
    SearchService,
    CrmAnalyticsService,
  ],
  exports: [TimelineService, TagsService, CrmAnalyticsService, TasksService],
})
export class CrmModule {}
