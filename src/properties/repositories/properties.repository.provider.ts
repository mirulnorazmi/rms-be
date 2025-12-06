import { Injectable, Provider } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from '../../constants';
import { Repository } from 'typeorm';
import { PROPERTIES_REPOSITORY_TOKEN } from './properties.repository.interface';
import { PropertiesTypeOrmRepository } from './implementations/properties.typeorm.repository';
import { Properties } from '../models/properties.model';

export function providePropertiesRepository(): Provider[] {
  return [
    {
      provide: PROPERTIES_REPOSITORY_TOKEN,
      useFactory: (dependenciesProvider: PropertiesRepoDependenciesProvider) =>
        providePropertiesRepositoryFactory(dependenciesProvider),
      inject: [PropertiesRepoDependenciesProvider],
    },
    PropertiesRepoDependenciesProvider,
  ];
}

function providePropertiesRepositoryFactory(
  dependenciesProvider: PropertiesRepoDependenciesProvider,
) {
  const dataSourceEnv = process.env.PROPERTIES_DATASOURCE;

  if (
    !dataSourceEnv ||
    !Object.values(DataSource).includes(dataSourceEnv as DataSource)
  ) {
    throw new Error(`Invalid PROPERTIES_DATASOURCE: ${dataSourceEnv}`);
  }

  const dataSource = dataSourceEnv as DataSource;

  switch (dataSource) {
    case DataSource.TYPEORM:
      return new PropertiesTypeOrmRepository(dependenciesProvider.typeOrmRepository);
  }
}

@Injectable()
export class PropertiesRepoDependenciesProvider {
  constructor(
    @InjectRepository(Properties)
    public typeOrmRepository: Repository<Properties>,
  ) {}
}

