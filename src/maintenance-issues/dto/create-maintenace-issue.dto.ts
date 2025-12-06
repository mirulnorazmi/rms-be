import { IsNotEmpty, IsString, IsInt, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMaintenanceIssueDto {
  @ApiProperty({ description: 'Unit ID' })
  @IsInt()
  @IsNotEmpty()
  unit_id: number;

  @ApiProperty({ description: 'User ID who reported the issue' })
  @IsInt()
  @IsNotEmpty()
  reported_by_id: number;

  @ApiProperty({ description: 'Title of the maintenance issue', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Description of the issue (optional if image provided)' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Category of the issue' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Priority level (will be set by AI if not provided)' })
  @IsEnum(['Low', 'Medium', 'High'])
  @IsOptional()
  priority?: 'Low' | 'Medium' | 'High';

  @ApiPropertyOptional({ 
    description: 'Whether to use AI analysis even if description is provided',
    default: false 
  })
  @IsBoolean()
  @IsOptional()
  useAI?: boolean = false;
}