import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidatesService } from './candidates.service';
import {
  CreateCandidateDto,
  UpdateCandidateDto,
  UpdateSkillsDto,
  UpdateExperienceDto,
  CreateNoteDto,
  CandidateQueryDto,
} from './dto/candidate.dto';
import { CurrentUser } from '../common/decorators/auth.decorator';

@Controller('candidates')
export class CandidatesController {
  constructor(private candidatesService: CandidatesService) {}

  @Get()
  findAll(@CurrentUser('organizationId') orgId: string, @Query() query: CandidateQueryDto) {
    return this.candidatesService.findAll(orgId, query);
  }

  @Post()
  create(@CurrentUser('organizationId') orgId: string, @Body() dto: CreateCandidateDto) {
    return this.candidatesService.create(orgId, dto);
  }

  @Get(':id')
  findOne(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.candidatesService.findOne(orgId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('organizationId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCandidateDto,
  ) {
    return this.candidatesService.update(orgId, id, dto);
  }

  @Patch(':id/skills')
  updateSkills(
    @CurrentUser('organizationId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSkillsDto,
  ) {
    return this.candidatesService.updateSkills(orgId, id, dto);
  }

  @Patch(':id/experience')
  updateExperience(
    @CurrentUser('organizationId') orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.candidatesService.updateExperience(orgId, id, dto);
  }

  @Post(':id/notes')
  addNote(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.candidatesService.addNote(orgId, id, userId, dto);
  }

  @Post(':id/resumes')
  @UseInterceptors(FileInterceptor('file'))
  uploadResume(
    @CurrentUser('organizationId') orgId: string,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.candidatesService.addResume(orgId, id, file);
  }
}
