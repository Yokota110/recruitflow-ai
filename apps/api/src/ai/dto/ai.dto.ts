import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayMinSize } from 'class-validator';

export class AnalyzeResumeDto {
  @IsString()
  @IsNotEmpty()
  applicationId!: string;

  @IsString()
  @IsOptional()
  resumeId?: string;
}

export class InterviewQuestionsDto {
  @IsString()
  @IsNotEmpty()
  candidateId!: string;

  @IsString()
  @IsOptional()
  applicationId?: string;
}

export class CompareCandidatesDto {
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  candidateIds!: string[];
}
