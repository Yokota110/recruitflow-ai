import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsDateString, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InterviewStatus, PipelineStage } from '@prisma/client';

export class CreateInterviewDto {
  @IsString()
  @IsNotEmpty()
  applicationId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(PipelineStage)
  @IsOptional()
  stage?: PipelineStage;

  @IsDateString()
  scheduledAt!: string;

  @IsInt()
  @Min(15)
  @IsOptional()
  durationMin?: number;

  @IsString()
  @IsOptional()
  meetingUrl?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateInterviewDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsInt()
  @Min(15)
  @IsOptional()
  durationMin?: number;

  @IsString()
  @IsOptional()
  meetingUrl?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(InterviewStatus)
  @IsOptional()
  status?: InterviewStatus;
}

export class StructuredFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  communication!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  technicalSkills!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  cultureFit!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  recommendation!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class InterviewFeedbackDto {
  @IsString()
  @IsOptional()
  feedback?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;
}

export class InterviewQueryDto {
  @IsString()
  @IsOptional()
  jobId?: string;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
