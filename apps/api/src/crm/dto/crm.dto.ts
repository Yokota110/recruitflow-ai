import {
  IsString, IsOptional, IsEnum, IsArray, IsDateString, IsInt, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CandidateSource, TaskType, TaskStatus, EmailTemplateType, TalentPoolStatus,
} from '@prisma/client';

export class TalentPoolQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @IsEnum(TalentPoolStatus) status?: TalentPoolStatus;
}

export class CreateTalentPoolCandidateDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsString() email: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsEnum(CandidateSource) source?: CandidateSource;
  @IsOptional() @Type(() => Number) yearsExperience?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) skills?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}

export class MoveToJobDto {
  @IsString() jobId: string;
}

export class CreateTagDto {
  @IsString() name: string;
  @IsOptional() @IsString() color?: string;
}

export class AddTagToCandidateDto {
  @IsString() tagId: string;
}

export class CreateTaskDto {
  @IsString() title: string;
  @IsOptional() @IsEnum(TaskType) type?: TaskType;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() candidateId?: string;
  @IsOptional() @IsDateString() dueDate?: string;
}

export class UpdateTaskDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsEnum(TaskType) type?: TaskType;
  @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsDateString() dueDate?: string;
}

export class CreateTemplateDto {
  @IsString() name: string;
  @IsString() subject: string;
  @IsString() body: string;
  @IsEnum(EmailTemplateType) type: EmailTemplateType;
}

export class UpdateTemplateDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() subject?: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsEnum(EmailTemplateType) type?: EmailTemplateType;
}

export class PreviewTemplateDto {
  @IsString() subject: string;
  @IsString() body: string;
  @IsOptional() @IsString() candidateName?: string;
  @IsOptional() @IsString() jobTitle?: string;
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() interviewDate?: string;
}

export class CreateCampaignDto {
  @IsString() name: string;
  @IsString() templateId: string;
  @IsArray() @IsString({ each: true }) candidateIds: string[];
  @IsOptional() @IsDateString() sendDate?: string;
}

export class SearchQueryDto {
  @IsString() q: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit?: number;
}
