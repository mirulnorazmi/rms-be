import { IsNotEmpty, IsString, IsInt, IsOptional, MaxLength } from 'class-validator';

export class PropertyDto {
  @IsInt()
  @IsNotEmpty()
  readonly landlord_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  readonly zip_code: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  readonly main_image_path?: string;
}

