import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import {
  CreateInterviewDto,
  UpdateInterviewDto,
  StructuredFeedbackDto,
  InterviewQueryDto,
} from './dto/interview.dto';
import { CurrentUser } from '../common/decorators/auth.decorator';

@Controller('interviews')
export class InterviewsController {
  constructor(private interviewsService: InterviewsService) {}

  @Get()
  findAll(@CurrentUser('organizationId') orgId: string, @Query() query: InterviewQueryDto) {
    return this.interviewsService.findAll(orgId, query);
  }

  @Post()
  create(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateInterviewDto,
  ) {
    return this.interviewsService.create(orgId, userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('organizationId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInterviewDto,
  ) {
    return this.interviewsService.update(orgId, id, dto);
  }

  @Post(':id/feedback')
  submitFeedback(
    @CurrentUser('organizationId') orgId: string,
    @Param('id') id: string,
    @Body() dto: StructuredFeedbackDto,
  ) {
    return this.interviewsService.submitStructuredFeedback(orgId, id, dto);
  }
}
