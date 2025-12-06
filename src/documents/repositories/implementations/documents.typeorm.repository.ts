import { Documents } from '../../models/documents.model';
import { DocumentsRepository } from '../documents.repository.interface';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { DocumentDto } from '../../dto/document.dto';
import { DocumentUpdateDto } from '../../dto/document-update.dto';
import { IDocument } from '../../interfaces/document.interface';
import { DocType } from '../../enums/doc-type.enum';

export class DocumentsTypeOrmRepository implements DocumentsRepository {
  constructor(private readonly documentsRepository: Repository<Documents>) {}

  public async findAll(): Promise<Documents[]> {
    return await this.documentsRepository.find({
      relations: ['contract', 'uploaded_by'],
      order: { uploaded_at: 'DESC' },
    });
  }

  public async findById(docId: number): Promise<Documents | null> {
    return await this.documentsRepository.findOne({
      where: { doc_id: docId },
      relations: ['contract', 'uploaded_by'],
    });
  }

  public async findByContractId(contractId: number): Promise<Documents[]> {
    return await this.documentsRepository.find({
      where: { contract_id: contractId },
      relations: ['contract', 'uploaded_by'],
      order: { uploaded_at: 'DESC' },
    });
  }

  public async findByUploadedById(uploadedById: number): Promise<Documents[]> {
    return await this.documentsRepository.find({
      where: { uploaded_by_id: uploadedById },
      relations: ['contract', 'uploaded_by'],
      order: { uploaded_at: 'DESC' },
    });
  }

  public async findByDocType(docType: DocType): Promise<Documents[]> {
    return await this.documentsRepository.find({
      where: { doc_type: docType },
      relations: ['contract', 'uploaded_by'],
      order: { uploaded_at: 'DESC' },
    });
  }

  public async create(documentDto: DocumentDto): Promise<IDocument> {
    return await this.documentsRepository.save(documentDto);
  }

  public async update(
    docId: number,
    documentUpdateDto: DocumentUpdateDto,
  ): Promise<UpdateResult> {
    return await this.documentsRepository.update(
      { doc_id: docId },
      { ...documentUpdateDto },
    );
  }

  public async delete(docId: number): Promise<DeleteResult> {
    return await this.documentsRepository.delete({ doc_id: docId });
  }
}

