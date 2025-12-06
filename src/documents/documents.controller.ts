import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentDto } from './dto/document.dto';
import { DocumentUpdateDto } from './dto/document-update.dto';
import { IDocument } from './interfaces/document.interface';
import { DocType } from './enums/doc-type.enum';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';

interface ApiResponseMessage {
  message: string;
  status: number;
}

@ApiTags('documents')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Find all documents' })
  @ApiResponse({ status: 200, description: 'Get all documents' })
  public async findAll(): Promise<IDocument[]> {
    return this.documentsService.findAll();
  }

  @Get('/:docId')
  @ApiOperation({ summary: 'Find a document by id' })
  @ApiResponse({ status: 200, description: 'Get a document by id' })
  @ApiNotFoundResponse({ description: 'Document not found' })
  public async findOne(
    @Param('docId', ParseIntPipe) docId: number,
  ): Promise<IDocument> {
    return this.documentsService.findById(docId);
  }

  @Get('/contract/:contractId')
  @ApiOperation({ summary: 'Find all documents by contract id' })
  @ApiResponse({ status: 200, description: 'Get all documents by contract id' })
  public async findByContractId(
    @Param('contractId', ParseIntPipe) contractId: number,
  ): Promise<IDocument[]> {
    return this.documentsService.findByContractId(contractId);
  }

  @Get('/uploader/:uploadedById')
  @ApiOperation({ summary: 'Find all documents by uploader id' })
  @ApiResponse({ status: 200, description: 'Get all documents by uploader id' })
  public async findByUploadedById(
    @Param('uploadedById', ParseIntPipe) uploadedById: number,
  ): Promise<IDocument[]> {
    return this.documentsService.findByUploadedById(uploadedById);
  }

  @Get('/search/type')
  @ApiOperation({ summary: 'Find all documents by document type' })
  @ApiResponse({ status: 200, description: 'Get all documents by document type' })
  @ApiQuery({ name: 'docType', required: true, enum: DocType })
  public async findByDocType(
    @Query('docType') docType: DocType,
  ): Promise<IDocument[]> {
    return this.documentsService.findByDocType(docType);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new document' })
  @ApiCreatedResponse({ description: 'Document created successfully' })
  @ApiBadRequestResponse({ description: 'Document not created' })
  public async create(@Body() documentDto: DocumentDto): Promise<IDocument> {
    return this.documentsService.create(documentDto);
  }

  @Put('/:docId')
  @ApiOperation({ summary: 'Update a document by id' })
  @ApiResponse({ status: 200, description: 'Update a document by id' })
  @ApiBadRequestResponse({ description: 'Document not updated' })
  public async update(
    @Param('docId', ParseIntPipe) docId: number,
    @Body() documentUpdateDto: DocumentUpdateDto,
  ): Promise<ApiResponseMessage> {
    try {
      await this.documentsService.update(docId, documentUpdateDto);

      return {
        message: 'Document updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Document not updated!');
    }
  }

  @Delete('/:docId')
  @ApiOperation({ summary: 'Delete a document by id' })
  @ApiResponse({ status: 200, description: 'Delete a document by id' })
  @ApiNotFoundResponse({ description: 'Document not found' })
  public async delete(
    @Param('docId', ParseIntPipe) docId: number,
  ): Promise<ApiResponseMessage> {
    await this.documentsService.delete(docId);

    return {
      message: 'Document deleted successfully!',
      status: HttpStatus.OK,
    };
  }
}

