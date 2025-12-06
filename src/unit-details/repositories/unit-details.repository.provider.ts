import { DataSource } from 'typeorm';
import { UnitDetails } from '../models/unit-details.model';
import { UNIT_DETAILS_REPOSITORY_TOKEN } from './unit-details.repository.interface';
import { UnitDetailsTypeOrmRepository } from './implementations/unit-details.typeorm.repository';

export const unitDetailsRepositoryProvider = {
  provide: UNIT_DETAILS_REPOSITORY_TOKEN,
  useFactory: (dataSource: DataSource) => {
    const dataSourceName = process.env.UNIT_DETAILS_DATASOURCE;

    switch (dataSourceName) {
      case 'typeorm':
        return new UnitDetailsTypeOrmRepository(
          dataSource.getRepository(UnitDetails),
        );
      default:
        throw new Error(
          `Invalid UNIT_DETAILS_DATASOURCE: ${dataSourceName}. Check your .env file.`,
        );
    }
  },
  inject: [DataSource],
};

