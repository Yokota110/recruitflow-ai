import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, MoveStageDto, RejectApplicationDto } from './dto/application.dto';
import { CurrentUser } from '../common/decorators/auth.decorator';

@Controller('applications')
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post()
  create(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(orgId, userId, dto);
  }

  @Patch(':id/stage')
  moveStage(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: MoveStageDto,
  ) {
    return this.applicationsService.moveStage(orgId, id, userId, dto);
  }

  @Post(':id/reject')
  reject(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: RejectApplicationDto,
  ) {
    return this.applicationsService.reject(orgId, id, userId, dto);
  }

  @Get(':id/history')
  getHistory(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.applicationsService.getHistory(orgId, id);
  }
}
