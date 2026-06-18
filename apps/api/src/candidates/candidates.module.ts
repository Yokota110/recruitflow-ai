import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { UploadsModule } from '../uploads/uploads.module';
import { CrmModule } from '../crm/crm.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [UploadsModule, CrmModule, WorkflowsModule],
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [CandidatesService],
})
export class CandidatesModule {}
