import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DocType } from '../../documents/enums/doc-type.enum';

export class TenantDocumentItemDto {
  @ApiProperty({ description: 'Document ID' })
  doc_id: number;

  @ApiProperty({ description: 'Document name/filename' })
  document_name: string;

  @ApiProperty({ enum: DocType, description: 'Document category' })
  category: DocType;

  @ApiProperty({ description: 'Date document was added' })
  date_added: Date;

  @ApiProperty({ description: 'File path in storage' })
  file_path: string;

  @ApiProperty({ description: 'Full URL to download/view the file' })
  file_url: string;
}

export class TenantDocumentsDto {
  @ApiProperty({ description: 'Total number of files stored' })
  no_of_files_stored: number;

  @ApiProperty({ type: [TenantDocumentItemDto], description: 'List of documents' })
  documents: TenantDocumentItemDto[];
}

export class UploadDocumentDto {
  @ApiProperty({
    enum: DocType,
    description: 'Document type/category',
    example: DocType.CONTRACT_LEASE,
  })
  @IsNotEmpty()
  @IsEnum(DocType)
  document_type: DocType;

  @ApiPropertyOptional({ description: 'Custom file name (optional, defaults to uploaded filename)' })
  @IsString()
  file_name?: string;
}

export class UploadDocumentResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional({ type: TenantDocumentItemDto })
  document?: TenantDocumentItemDto;
}

export class DeleteDocumentResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}

