import { Module } from '@nestjs/common';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowGeneratorService } from './workflow-generator.service';
import { SmartAlertsService } from './smart-alerts.service';

@Module({
  controllers: [WorkflowsController],
  providers: [
    WorkflowsService,
    WorkflowEngineService,
    WorkflowGeneratorService,
    SmartAlertsService,
  ],
  exports: [WorkflowEngineService, SmartAlertsService],
})
export class WorkflowsModule {}
