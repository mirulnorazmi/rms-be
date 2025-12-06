import { Injectable, Provider } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from '../../constants';
import { Repository } from 'typeorm';
import { CONTRACTS_REPOSITORY_TOKEN } from './contracts.repository.interface';
import { ContractsTypeOrmRepository } from './implementations/contracts.typeorm.repository';
import { Contracts } from '../models/contracts.model';

export function provideContractsRepository(): Provider[] {
  return [
    {
      provide: CONTRACTS_REPOSITORY_TOKEN,
      useFactory: (dependenciesProvider: ContractsRepoDependenciesProvider) =>
        provideContractsRepositoryFactory(dependenciesProvider),
      inject: [ContractsRepoDependenciesProvider],
    },
    ContractsRepoDependenciesProvider,
  ];
}

function provideContractsRepositoryFactory(
  dependenciesProvider: ContractsRepoDependenciesProvider,
) {
  const dataSourceEnv = process.env.CONTRACTS_DATASOURCE;

  if (
    !dataSourceEnv ||
    !Object.values(DataSource).includes(dataSourceEnv as DataSource)
  ) {
    throw new Error(`Invalid CONTRACTS_DATASOURCE: ${dataSourceEnv}`);
  }

  const dataSource = dataSourceEnv as DataSource;

  switch (dataSource) {
    case DataSource.TYPEORM:
      return new ContractsTypeOrmRepository(dependenciesProvider.typeOrmRepository);
  }
}

@Injectable()
export class ContractsRepoDependenciesProvider {
  constructor(
    @InjectRepository(Contracts)
    public typeOrmRepository: Repository<Contracts>,
  ) {}
}

