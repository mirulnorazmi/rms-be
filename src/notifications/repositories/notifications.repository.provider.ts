import { Injectable, Provider } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from '../../constants';
import { Repository } from 'typeorm';
import { NOTIFICATIONS_REPOSITORY_TOKEN } from './notifications.repository.interface';
import { NotificationsTypeOrmRepository } from './implementations/notifications.typeorm.repository';
import { Notifications } from '../models/notifications.model';

export function provideNotificationsRepository(): Provider[] {
  return [
    {
      provide: NOTIFICATIONS_REPOSITORY_TOKEN,
      useFactory: (dependenciesProvider: NotificationsRepoDependenciesProvider) =>
        provideNotificationsRepositoryFactory(dependenciesProvider),
      inject: [NotificationsRepoDependenciesProvider],
    },
    NotificationsRepoDependenciesProvider,
  ];
}

function provideNotificationsRepositoryFactory(
  dependenciesProvider: NotificationsRepoDependenciesProvider,
) {
  const dataSourceEnv = process.env.NOTIFICATIONS_DATASOURCE;

  if (
    !dataSourceEnv ||
    !Object.values(DataSource).includes(dataSourceEnv as DataSource)
  ) {
    throw new Error(`Invalid NOTIFICATIONS_DATASOURCE: ${dataSourceEnv}`);
  }

  const dataSource = dataSourceEnv as DataSource;

  switch (dataSource) {
    case DataSource.TYPEORM:
      return new NotificationsTypeOrmRepository(dependenciesProvider.typeOrmRepository);
  }
}

@Injectable()
export class NotificationsRepoDependenciesProvider {
  constructor(
    @InjectRepository(Notifications)
    public typeOrmRepository: Repository<Notifications>,
  ) {}
}

