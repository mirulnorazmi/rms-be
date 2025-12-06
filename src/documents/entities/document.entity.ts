import { DocType } from '../enums/doc-type.enum';

export class Document {
  constructor(
    public doc_id: number,
    public contract_id: number,
    public uploaded_by_id: number,
    public doc_type: DocType,
    public file_path: string,
    public uploaded_at: Date,
  ) {}
}

