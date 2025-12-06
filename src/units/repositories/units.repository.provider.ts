import { Injectable, Provider } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from '../../constants';
import { Repository } from 'typeorm';
import { UNITS_REPOSITORY_TOKEN } from './units.repository.interface';
import { UnitsTypeOrmRepository } from './implementations/units.typeorm.repository';
import { Units } from '../models/units.model';

export function provideUnitsRepository(): Provider[] {
  return [
    {
      provide: UNITS_REPOSITORY_TOKEN,
      useFactory: (dependenciesProvider: UnitsRepoDependenciesProvider) =>
        provideUnitsRepositoryFactory(dependenciesProvider),
      inject: [UnitsRepoDependenciesProvider],
    },
    UnitsRepoDependenciesProvider,
  ];
}

function provideUnitsRepositoryFactory(
  dependenciesProvider: UnitsRepoDependenciesProvider,
) {
  const dataSourceEnv = process.env.UNITS_DATASOURCE;

  if (
    !dataSourceEnv ||
    !Object.values(DataSource).includes(dataSourceEnv as DataSource)
  ) {
    throw new Error(`Invalid UNITS_DATASOURCE: ${dataSourceEnv}`);
  }

  const dataSource = dataSourceEnv as DataSource;

  switch (dataSource) {
    case DataSource.TYPEORM:
      return new UnitsTypeOrmRepository(dependenciesProvider.typeOrmRepository);
  }
}

@Injectable()
export class UnitsRepoDependenciesProvider {
  constructor(
    @InjectRepository(Units)
    public typeOrmRepository: Repository<Units>,
  ) {}
}

