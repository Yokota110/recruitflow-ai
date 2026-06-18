import {
  Controller, Get, Post, Patch, Delete, Body, Param,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/auth.decorator';
import { WorkflowsService } from './workflows.service';
import { WorkflowGeneratorService } from './workflow-generator.service';
import { SmartAlertsService } from './smart-alerts.service';
import {
  CreateWorkflowDto, UpdateWorkflowDto, GenerateWorkflowDto, InstallTemplateDto,
} from './dto/workflow.dto';

@Controller('workflows')
export class WorkflowsController {
  constructor(
    private workflows: WorkflowsService,
    private generator: WorkflowGeneratorService,
    private smartAlerts: SmartAlertsService,
  ) {}

  @Get()
  findAll(@CurrentUser('organizationId') orgId: string) {
    return this.workflows.findAll(orgId);
  }

  @Get('templates')
  getTemplates() {
    return this.workflows.getTemplates();
  }

  @Post('templates/install')
  installTemplate(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: InstallTemplateDto,
  ) {
    return this.workflows.installTemplate(orgId, userId, dto.slug);
  }

  @Get('logs')
  getLogs(@CurrentUser('organizationId') orgId: string) {
    return this.workflows.getExecutions(orgId);
  }

  @Get('analytics')
  getAnalytics(@CurrentUser('organizationId') orgId: string) {
    return this.workflows.getAnalytics(orgId);
  }

  @Get('smart-alerts')
  getSmartAlerts(@CurrentUser('organizationId') orgId: string) {
    return this.smartAlerts.generateSmartAlerts(orgId);
  }

  @Post('generate')
  generate(@Body() dto: GenerateWorkflowDto) {
    return this.generator.generateWorkflowFromPrompt(dto.prompt);
  }

  @Get(':id')
  findOne(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.workflows.findOne(orgId, id);
  }

  @Post()
  create(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateWorkflowDto,
  ) {
    return this.workflows.create(orgId, userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('organizationId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
  ) {
    return this.workflows.update(orgId, id, dto);
  }

  @Post(':id/clone')
  clone(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.workflows.clone(orgId, userId, id);
  }

  @Delete(':id')
  remove(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.workflows.remove(orgId, id);
  }

  @Patch(':id/enable')
  enable(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.workflows.enable(orgId, id);
  }

  @Patch(':id/disable')
  disable(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.workflows.disable(orgId, id);
  }
}
