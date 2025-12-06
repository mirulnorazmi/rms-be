import { DocType } from '../../documents/enums/doc-type.enum';

export interface ITenantDocumentItem {
  doc_id: number;
  document_name: string;
  category: DocType;
  date_added: Date;
  file_path: string;
  file_url: string;
}

export interface ITenantDocuments {
  no_of_files_stored: number;
  documents: ITenantDocumentItem[];
}

export interface IUploadDocumentResponse {
  success: boolean;
  message: string;
  document?: ITenantDocumentItem;
}

export interface IDeleteDocumentResponse {
  success: boolean;
  message: string;
}

