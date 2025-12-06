import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documents } from './models/documents.model';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { provideDocumentsRepository } from './repositories/documents.repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Documents])],
  controllers: [DocumentsController],
  providers: [DocumentsService, ...provideDocumentsRepository()],
  exports: [DocumentsService],
})
export class DocumentsModule {}

