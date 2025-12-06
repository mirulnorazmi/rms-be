import { PartialType } from '@nestjs/swagger';
import { DocumentDto } from './document.dto';

export class DocumentUpdateDto extends PartialType(DocumentDto) {}

