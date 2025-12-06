import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UnitDetailsDto {
  @ApiPropertyOptional({ description: 'Unit detail ID (auto-generated)' })
  @IsOptional()
  @IsInt()
  unit_detail_id?: number;

  @ApiProperty({ description: 'Unit ID (foreign key from units table)' })
  @IsNotEmpty()
  @IsInt()
  unit_id: number;

  @ApiProperty({ description: 'Type of unit (e.g., Studio, 1BR, 2BR)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  type: string;

  @ApiProperty({ description: 'Size of unit (e.g., 500 sqft, 1000 sqft)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  size: string;

  @ApiProperty({ description: 'Monthly rent amount' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  monthly_rent: string;

  @ApiProperty({ description: 'Deposit amount' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  deposit: string;

  @ApiProperty({ description: 'Facilities available (e.g., WiFi, Parking, Gym)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  facilities: string;
}

