import { DocumentDto } from '../dto/document.dto';
import { DocumentUpdateDto } from '../dto/document-update.dto';
import { DocType } from '../enums/doc-type.enum';

export interface DocumentsRepository {
  findAll(): void;
  findById(docId: number): void;
  findByContractId(contractId: number): void;
  findByUploadedById(uploadedById: number): void;
  findByDocType(docType: DocType): void;
  create(documentDto: DocumentDto): void;
  update(docId: number, documentUpdateDto: DocumentUpdateDto): void;
  delete(docId: number): void;
}

export const DOCUMENTS_REPOSITORY_TOKEN = 'documents-repository-token';

