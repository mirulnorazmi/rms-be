import { Injectable, Provider } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from '../../constants';
import { Repository } from 'typeorm';
import { PAYMENTS_REPOSITORY_TOKEN } from './payments.repository.interface';
import { PaymentsTypeOrmRepository } from './implementations/payments.typeorm.repository';
import { Payments } from '../models/payments.model';

export function providePaymentsRepository(): Provider[] {
  return [
    {
      provide: PAYMENTS_REPOSITORY_TOKEN,
      useFactory: (dependenciesProvider: PaymentsRepoDependenciesProvider) =>
        providePaymentsRepositoryFactory(dependenciesProvider),
      inject: [PaymentsRepoDependenciesProvider],
    },
    PaymentsRepoDependenciesProvider,
  ];
}

function providePaymentsRepositoryFactory(
  dependenciesProvider: PaymentsRepoDependenciesProvider,
) {
  const dataSourceEnv = process.env.PAYMENTS_DATASOURCE;

  if (
    !dataSourceEnv ||
    !Object.values(DataSource).includes(dataSourceEnv as DataSource)
  ) {
    throw new Error(`Invalid PAYMENTS_DATASOURCE: ${dataSourceEnv}`);
  }

  const dataSource = dataSourceEnv as DataSource;

  switch (dataSource) {
    case DataSource.TYPEORM:
      return new PaymentsTypeOrmRepository(dependenciesProvider.typeOrmRepository);
  }
}

@Injectable()
export class PaymentsRepoDependenciesProvider {
  constructor(
    @InjectRepository(Payments)
    public typeOrmRepository: Repository<Payments>,
  ) {}
}

