import { Injectable, Provider } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from '../../constants';
import { Repository } from 'typeorm';
import { ROLES_REPOSITORY_TOKEN } from './roles.repository.interface';
import { RolesTypeOrmRepository } from './implementations/roles.typeorm.repository';
import { Roles } from '../models/roles.model';

export function provideRolesRepository(): Provider[] {
  return [
    {
      provide: ROLES_REPOSITORY_TOKEN,
      useFactory: (dependenciesProvider: RolesRepoDependenciesProvider) =>
        provideRolesRepositoryFactory(dependenciesProvider),
      inject: [RolesRepoDependenciesProvider],
    },
    RolesRepoDependenciesProvider,
  ];
}

function provideRolesRepositoryFactory(
  dependenciesProvider: RolesRepoDependenciesProvider,
) {
  const dataSourceEnv = process.env.ROLES_DATASOURCE;

  if (
    !dataSourceEnv ||
    !Object.values(DataSource).includes(dataSourceEnv as DataSource)
  ) {
    throw new Error(`Invalid ROLES_DATASOURCE: ${dataSourceEnv}`);
  }

  const dataSource = dataSourceEnv as DataSource;

  switch (dataSource) {
    case DataSource.TYPEORM:
      return new RolesTypeOrmRepository(dependenciesProvider.typeOrmRepository);
  }
}

@Injectable()
export class RolesRepoDependenciesProvider {
  constructor(
    @InjectRepository(Roles)
    public typeOrmRepository: Repository<Roles>,
  ) {}
}

