import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { PipelineStage } from '@prisma/client';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  jobId!: string;

  @IsString()
  @IsNotEmpty()
  candidateId!: string;
}

export class MoveStageDto {
  @IsEnum(PipelineStage)
  stage!: PipelineStage;

  @IsOptional()
  position?: number;
}

export class RejectApplicationDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
