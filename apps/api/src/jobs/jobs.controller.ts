import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto, JobQueryDto } from './dto/job.dto';
import { CurrentUser } from '../common/decorators/auth.decorator';

@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  findAll(@CurrentUser('organizationId') orgId: string, @Query() query: JobQueryDto) {
    return this.jobsService.findAll(orgId, query);
  }

  @Post()
  create(@CurrentUser('organizationId') orgId: string, @Body() dto: CreateJobDto) {
    return this.jobsService.create(orgId, dto);
  }

  @Get(':id')
  findOne(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.jobsService.findOne(orgId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('organizationId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.update(orgId, id, dto);
  }

  @Post(':id/publish')
  publish(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.jobsService.publish(orgId, id);
  }

  @Post(':id/archive')
  archive(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.jobsService.archive(orgId, id);
  }

  @Get(':id/pipeline')
  getPipeline(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.jobsService.getPipeline(orgId, id);
  }
}
