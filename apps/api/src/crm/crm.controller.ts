import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/auth.decorator';
import { TalentPoolService } from './talent-pool/talent-pool.service';
import { TagsService } from './tags/tags.service';
import { TimelineService } from './timeline/timeline.service';
import { OutreachService } from './outreach/outreach.service';
import { TemplatesService } from './outreach/templates.service';
import { TasksService } from './tasks/tasks.service';
import { SearchService } from './search/search.service';
import { CrmAnalyticsService } from './analytics/crm-analytics.service';
import {
  TalentPoolQueryDto, CreateTalentPoolCandidateDto, MoveToJobDto,
  CreateTagDto, AddTagToCandidateDto,
  CreateTaskDto, UpdateTaskDto,
  CreateTemplateDto, UpdateTemplateDto, PreviewTemplateDto,
  CreateCampaignDto, SearchQueryDto,
} from './dto/crm.dto';
import { TaskStatus } from '@prisma/client';

@Controller('crm')
export class CrmController {
  constructor(
    private talentPool: TalentPoolService,
    private tags: TagsService,
    private timeline: TimelineService,
    private outreach: OutreachService,
    private templates: TemplatesService,
    private tasks: TasksService,
    private search: SearchService,
    private analytics: CrmAnalyticsService,
  ) {}

  // Talent Pool
  @Get('talent-pool')
  getTalentPool(@CurrentUser('organizationId') orgId: string, @Query() query: TalentPoolQueryDto) {
    return this.talentPool.findAll(orgId, query);
  }

  @Post('talent-pool')
  createTalentPoolCandidate(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTalentPoolCandidateDto,
  ) {
    return this.talentPool.create(orgId, userId, dto);
  }

  @Patch('talent-pool/:id/archive')
  archiveCandidate(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.talentPool.archive(orgId, id);
  }

  @Post('talent-pool/:id/move-to-job')
  moveToJob(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: MoveToJobDto,
  ) {
    return this.talentPool.moveToJob(orgId, userId, id, dto);
  }

  // Tags
  @Get('tags')
  getTags(@CurrentUser('organizationId') orgId: string) {
    return this.tags.findAll(orgId);
  }

  @Post('tags')
  createTag(@CurrentUser('organizationId') orgId: string, @Body() dto: CreateTagDto) {
    return this.tags.create(orgId, dto);
  }

  @Post('candidates/:candidateId/tags')
  addTag(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Param('candidateId') candidateId: string,
    @Body() dto: AddTagToCandidateDto,
  ) {
    return this.tags.addToCandidate(orgId, userId, candidateId, dto);
  }

  @Delete('candidates/:candidateId/tags/:tagId')
  removeTag(
    @CurrentUser('organizationId') orgId: string,
    @Param('candidateId') candidateId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.tags.removeFromCandidate(orgId, candidateId, tagId);
  }

  // Timeline
  @Get('candidates/:candidateId/timeline')
  getTimeline(
    @CurrentUser('organizationId') orgId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.timeline.getTimeline(orgId, candidateId);
  }

  // Templates
  @Get('templates/variables')
  getTemplateVariables() {
    return this.templates.getVariables();
  }

  @Get('templates')
  getTemplates(@CurrentUser('organizationId') orgId: string) {
    return this.templates.findAll(orgId);
  }

  @Get('templates/:id')
  getTemplate(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.templates.findOne(orgId, id);
  }

  @Post('templates')
  createTemplate(@CurrentUser('organizationId') orgId: string, @Body() dto: CreateTemplateDto) {
    return this.templates.create(orgId, dto);
  }

  @Patch('templates/:id')
  updateTemplate(
    @CurrentUser('organizationId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templates.update(orgId, id, dto);
  }

  @Post('templates/preview')
  previewTemplate(@Body() dto: PreviewTemplateDto) {
    return this.templates.preview(dto);
  }

  // Outreach
  @Get('outreach')
  getCampaigns(@CurrentUser('organizationId') orgId: string) {
    return this.outreach.findAll(orgId);
  }

  @Get('outreach/:id')
  getCampaign(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.outreach.findOne(orgId, id);
  }

  @Post('outreach')
  createCampaign(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.outreach.create(orgId, userId, dto);
  }

  @Post('outreach/:id/send')
  sendCampaign(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.outreach.send(orgId, userId, id);
  }

  // Tasks
  @Get('tasks')
  getTasks(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Query('mine') mine?: string,
    @Query('status') status?: TaskStatus,
  ) {
    if (mine === 'true') return this.tasks.findAll(orgId, userId, status);
    return this.tasks.findAll(orgId, undefined, status);
  }

  @Get('tasks/my')
  getMyTasks(@CurrentUser('organizationId') orgId: string, @CurrentUser('sub') userId: string) {
    return this.tasks.findMyTasks(orgId, userId);
  }

  @Post('tasks')
  createTask(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasks.create(orgId, userId, dto);
  }

  @Patch('tasks/:id')
  updateTask(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(orgId, userId, id, dto);
  }

  // Search
  @Get('search')
  globalSearch(@CurrentUser('organizationId') orgId: string, @Query() query: SearchQueryDto) {
    return this.search.search(orgId, query);
  }

  // Analytics
  @Get('analytics/productivity')
  getProductivity(@CurrentUser('organizationId') orgId: string) {
    return this.analytics.getProductivity(orgId);
  }

  @Get('analytics/pipeline-sla')
  getPipelineSla(
    @CurrentUser('organizationId') orgId: string,
    @Query('jobId') jobId?: string,
  ) {
    return this.analytics.getPipelineSla(orgId, jobId);
  }
}
