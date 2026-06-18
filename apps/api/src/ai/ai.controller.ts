import { Controller, Get, Post, Body, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { CopilotService } from './copilot/copilot.service';
import { AnalyzeResumeDto, InterviewQuestionsDto, CompareCandidatesDto } from './dto/ai.dto';
import { CurrentUser } from '../common/decorators/auth.decorator';

@Controller('ai')
export class AiController {
  constructor(
    private aiService: AiService,
    private copilotService: CopilotService,
  ) {}

  @Get('recruiting-insights')
  getRecruitingInsights(@CurrentUser('organizationId') orgId: string) {
    return this.copilotService.getRecruitingInsights(orgId);
  }

  @Post('compare')
  compareCandidates(
    @CurrentUser('organizationId') orgId: string,
    @Body() dto: CompareCandidatesDto,
  ) {
    return this.copilotService.compareCandidates(orgId, dto.candidateIds);
  }

  @Post('interview-questions')
  generateInterviewQuestions(
    @CurrentUser('organizationId') orgId: string,
    @Body() dto: InterviewQuestionsDto,
  ) {
    return this.copilotService.generateInterviewQuestions(orgId, dto.candidateId, dto.applicationId);
  }

  @Post('parse-resume')
  @UseInterceptors(FileInterceptor('file'))
  parseResume(@UploadedFile() file: Express.Multer.File) {
    return this.copilotService.parseResume(file.originalname, file.buffer);
  }

  @Post('import-resume')
  @UseInterceptors(FileInterceptor('file'))
  importResume(
    @CurrentUser('organizationId') orgId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.copilotService.importResume(orgId, file);
  }

  @Get('candidates/:candidateId/summary')
  getCandidateSummary(
    @CurrentUser('organizationId') orgId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.copilotService.getCandidateSummary(orgId, candidateId);
  }

  @Get('candidates/:candidateId/career-gaps')
  getCareerGaps(
    @CurrentUser('organizationId') orgId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.copilotService.getCareerGaps(orgId, candidateId);
  }

  @Get('candidates/:candidateId/hiring-recommendation')
  getHiringRecommendation(
    @CurrentUser('organizationId') orgId: string,
    @Param('candidateId') candidateId: string,
    @Query('applicationId') applicationId?: string,
  ) {
    return this.copilotService.getHiringRecommendation(orgId, candidateId, applicationId);
  }

  @Post('analyze-resume')
  analyzeResume(@CurrentUser('organizationId') orgId: string, @Body() dto: AnalyzeResumeDto) {
    return this.aiService.analyzeResume(orgId, dto);
  }

  @Get('insights/:applicationId')
  getInsight(
    @CurrentUser('organizationId') orgId: string,
    @Param('applicationId') applicationId: string,
  ) {
    return this.aiService.getInsight(orgId, applicationId);
  }

  @Get('analyses/:applicationId')
  getAnalysis(
    @CurrentUser('organizationId') orgId: string,
    @Param('applicationId') applicationId: string,
  ) {
    return this.aiService.getInsight(orgId, applicationId);
  }
}
