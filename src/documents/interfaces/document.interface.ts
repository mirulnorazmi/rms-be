import { DocType } from '../enums/doc-type.enum';

export interface IDocument {
  readonly doc_id: number;
  readonly contract_id: number;
  readonly uploaded_by_id: number;
  readonly doc_type: DocType;
  readonly file_path: string;
  readonly uploaded_at: Date;
}

