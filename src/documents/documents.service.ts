import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { UpdateResult, DeleteResult } from 'typeorm';
import { IDocument } from './interfaces/document.interface';
import { Documents } from './models/documents.model';
import { DocumentDto } from './dto/document.dto';
import { DocumentUpdateDto } from './dto/document-update.dto';
import { DocType } from './enums/doc-type.enum';
import { DOCUMENTS_REPOSITORY_TOKEN } from './repositories/documents.repository.interface';
import { DocumentsTypeOrmRepository } from './repositories/implementations/documents.typeorm.repository';

@Injectable()
export class DocumentsService {
  constructor(
    @Inject(DOCUMENTS_REPOSITORY_TOKEN)
    private readonly documentsRepository: DocumentsTypeOrmRepository,
  ) {}

  public async findAll(): Promise<Documents[]> {
    return await this.documentsRepository.findAll();
  }

  public async findById(docId: number): Promise<Documents> {
    const document = await this.documentsRepository.findById(docId);

    if (!document) {
      throw new NotFoundException(`Document #${docId} not found`);
    }

    return document;
  }

  public async findByContractId(contractId: number): Promise<Documents[]> {
    return await this.documentsRepository.findByContractId(contractId);
  }

  public async findByUploadedById(uploadedById: number): Promise<Documents[]> {
    return await this.documentsRepository.findByUploadedById(uploadedById);
  }

  public async findByDocType(docType: DocType): Promise<Documents[]> {
    return await this.documentsRepository.findByDocType(docType);
  }

  public async create(documentDto: DocumentDto): Promise<IDocument> {
    try {
      return await this.documentsRepository.create(documentDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async update(
    docId: number,
    documentUpdateDto: DocumentUpdateDto,
  ): Promise<UpdateResult> {
    try {
      const document = await this.findById(docId);
      if (!document) {
        throw new NotFoundException(`Document #${docId} not found`);
      }
      return await this.documentsRepository.update(docId, documentUpdateDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async delete(docId: number): Promise<DeleteResult> {
    const document = await this.findById(docId);
    if (!document) {
      throw new NotFoundException(`Document #${docId} not found`);
    }
    return await this.documentsRepository.delete(docId);
  }
}

