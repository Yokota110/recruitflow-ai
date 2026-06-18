import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsDateString,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CandidateSource } from '@prisma/client';

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  linkedinUrl?: string;

  @IsEnum(CandidateSource)
  @IsOptional()
  source?: CandidateSource;
}

export class UpdateCandidateDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  linkedinUrl?: string;

  @IsEnum(CandidateSource)
  @IsOptional()
  source?: CandidateSource;
}

export class SkillDto {
  @IsString()
  name!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  level?: number;
}

export class ExperienceDto {
  @IsString()
  company!: string;

  @IsString()
  title!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;
}

export class UpdateSkillsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills!: SkillDto[];
}

export class UpdateExperienceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experiences!: ExperienceDto[];
}

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;
}

export class CandidateQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(CandidateSource)
  @IsOptional()
  source?: CandidateSource;

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

  @IsString()
  @IsOptional()
  tag?: string;
}
