import {
  IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  WorkflowTriggerType, WorkflowNodeType, WorkflowConditionField,
  WorkflowConditionOperator, WorkflowActionType,
} from '@prisma/client';

export class WorkflowConditionDto {
  @IsEnum(WorkflowConditionField) field!: WorkflowConditionField;
  @IsEnum(WorkflowConditionOperator) operator!: WorkflowConditionOperator;
  @IsString() value!: string;
}

export class WorkflowActionDto {
  @IsEnum(WorkflowActionType) actionType!: WorkflowActionType;
  @IsOptional() params?: Record<string, unknown>;
}

export class WorkflowNodeInputDto {
  @IsString() id!: string;
  @IsEnum(WorkflowNodeType) type!: WorkflowNodeType;
  @IsString() label!: string;
  @IsNumber() x!: number;
  @IsNumber() y!: number;
  @IsOptional() @ValidateNested() @Type(() => WorkflowConditionDto) condition?: WorkflowConditionDto;
  @IsOptional() @ValidateNested() @Type(() => WorkflowActionDto) action?: WorkflowActionDto;
  @IsOptional() @IsEnum(WorkflowTriggerType) triggerType?: WorkflowTriggerType;
}

export class WorkflowEdgeInputDto {
  @IsString() id!: string;
  @IsString() source!: string;
  @IsString() target!: string;
}

export class CreateWorkflowDto {
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(WorkflowTriggerType) triggerType!: WorkflowTriggerType;
  @IsArray() @ValidateNested({ each: true }) @Type(() => WorkflowNodeInputDto) nodes!: WorkflowNodeInputDto[];
  @IsArray() @ValidateNested({ each: true }) @Type(() => WorkflowEdgeInputDto) edges!: WorkflowEdgeInputDto[];
  @IsOptional() viewport?: { x: number; y: number; zoom: number };
}

export class UpdateWorkflowDto extends CreateWorkflowDto {}

export class GenerateWorkflowDto {
  @IsString() prompt!: string;
}

export class InstallTemplateDto {
  @IsString() slug!: string;
}
