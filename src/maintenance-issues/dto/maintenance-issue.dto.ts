import { IsNotEmpty, IsInt, IsEnum, IsString, MaxLength, IsOptional, IsDateString } from 'class-validator';
import { IssueStatus } from '../enums/issue-status.enum';
import { IssuePriority } from '../enums/issue-priority.enum';

export class MaintenanceIssueDto {
  @IsInt()
  @IsNotEmpty()
  readonly unit_id: number;

  @IsInt()
  @IsNotEmpty()
  readonly reported_by_id: number;

  @IsEnum(IssueStatus)
  @IsOptional()
  readonly status?: IssueStatus;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  readonly description: string;

  @IsEnum(IssuePriority)
  @IsNotEmpty()
  readonly priority: IssuePriority;

  @IsDateString()
  @IsOptional()
  readonly reported_date?: Date;

  @IsDateString()
  @IsOptional()
  readonly completion_date?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  // for Photo AI for Analysis
  readonly image_path?: string;
}

