import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UnitDetailsUpdateDto {
  @ApiPropertyOptional({ description: 'Unit ID (foreign key from units table)' })
  @IsOptional()
  @IsInt()
  unit_id?: number;

  @ApiPropertyOptional({ description: 'Type of unit (e.g., Studio, 1BR, 2BR)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  type?: string;

  @ApiPropertyOptional({ description: 'Size of unit (e.g., 500 sqft, 1000 sqft)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  size?: string;

  @ApiPropertyOptional({ description: 'Monthly rent amount' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  monthly_rent?: string;

  @ApiPropertyOptional({ description: 'Deposit amount' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  deposit?: string;

  @ApiPropertyOptional({ description: 'Facilities available (e.g., WiFi, Parking, Gym)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  facilities?: string;
}

