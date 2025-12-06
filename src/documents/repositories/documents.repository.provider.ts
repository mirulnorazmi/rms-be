import { Injectable, Provider } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from '../../constants';
import { Repository } from 'typeorm';
import { DOCUMENTS_REPOSITORY_TOKEN } from './documents.repository.interface';
import { DocumentsTypeOrmRepository } from './implementations/documents.typeorm.repository';
import { Documents } from '../models/documents.model';

export function provideDocumentsRepository(): Provider[] {
  return [
    {
      provide: DOCUMENTS_REPOSITORY_TOKEN,
      useFactory: (dependenciesProvider: DocumentsRepoDependenciesProvider) =>
        provideDocumentsRepositoryFactory(dependenciesProvider),
      inject: [DocumentsRepoDependenciesProvider],
    },
    DocumentsRepoDependenciesProvider,
  ];
}

function provideDocumentsRepositoryFactory(
  dependenciesProvider: DocumentsRepoDependenciesProvider,
) {
  const dataSourceEnv = process.env.DOCUMENTS_DATASOURCE;

  if (
    !dataSourceEnv ||
    !Object.values(DataSource).includes(dataSourceEnv as DataSource)
  ) {
    throw new Error(`Invalid DOCUMENTS_DATASOURCE: ${dataSourceEnv}`);
  }

  const dataSource = dataSourceEnv as DataSource;

  switch (dataSource) {
    case DataSource.TYPEORM:
      return new DocumentsTypeOrmRepository(dependenciesProvider.typeOrmRepository);
  }
}

@Injectable()
export class DocumentsRepoDependenciesProvider {
  constructor(
    @InjectRepository(Documents)
    public typeOrmRepository: Repository<Documents>,
  ) {}
}

