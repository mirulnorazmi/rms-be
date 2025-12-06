import { IsNotEmpty, IsInt, IsEnum, IsString, MaxLength, IsOptional, IsDateString } from 'class-validator';
import { DocType } from '../enums/doc-type.enum';

export class DocumentDto {
  @IsInt()
  @IsNotEmpty()
  readonly contract_id: number;

  @IsInt()
  @IsNotEmpty()
  readonly uploaded_by_id: number;

  @IsEnum(DocType)
  @IsNotEmpty()
  readonly doc_type: DocType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  readonly file_path: string;

  @IsDateString()
  @IsOptional()
  readonly uploaded_at?: Date;
}

