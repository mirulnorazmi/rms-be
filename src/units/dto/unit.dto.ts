import { IsNotEmpty, IsString, IsInt, IsOptional, MaxLength, IsNumber } from 'class-validator';

export class UnitDto {
  @IsInt()
  @IsNotEmpty()
  readonly property_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly unit_number: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  readonly monthly_rent: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly status: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  readonly main_image_path?: string;
}

