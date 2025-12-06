import { Injectable, Provider } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from '../../constants';
import { Repository } from 'typeorm';
import { MAINTENANCE_ISSUES_REPOSITORY_TOKEN } from './maintenance-issues.repository.interface';
import { MaintenanceIssuesTypeOrmRepository } from './implementations/maintenance-issues.typeorm.repository';
import { MaintenanceIssues } from '../models/maintenance-issues.model';

export function provideMaintenanceIssuesRepository(): Provider[] {
  return [
    {
      provide: MAINTENANCE_ISSUES_REPOSITORY_TOKEN,
      useFactory: (dependenciesProvider: MaintenanceIssuesRepoDependenciesProvider) =>
        provideMaintenanceIssuesRepositoryFactory(dependenciesProvider),
      inject: [MaintenanceIssuesRepoDependenciesProvider],
    },
    MaintenanceIssuesRepoDependenciesProvider,
  ];
}

function provideMaintenanceIssuesRepositoryFactory(
  dependenciesProvider: MaintenanceIssuesRepoDependenciesProvider,
) {
  const dataSourceEnv = process.env.MAINTENANCE_ISSUES_DATASOURCE;

  if (
    !dataSourceEnv ||
    !Object.values(DataSource).includes(dataSourceEnv as DataSource)
  ) {
    throw new Error(`Invalid MAINTENANCE_ISSUES_DATASOURCE: ${dataSourceEnv}`);
  }

  const dataSource = dataSourceEnv as DataSource;

  switch (dataSource) {
    case DataSource.TYPEORM:
      return new MaintenanceIssuesTypeOrmRepository(dependenciesProvider.typeOrmRepository);
  }
}

@Injectable()
export class MaintenanceIssuesRepoDependenciesProvider {
  constructor(
    @InjectRepository(MaintenanceIssues)
    public typeOrmRepository: Repository<MaintenanceIssues>,
  ) {}
}

