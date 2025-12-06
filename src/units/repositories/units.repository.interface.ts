import { UnitDto } from '../dto/unit.dto';
import { UnitUpdateDto } from '../dto/unit-update.dto';

export interface UnitsRepository {
  findAll(): void;
  findById(unitId: number): void;
  findByPropertyId(propertyId: number): void;
  findByStatus(status: string): void;
  create(unitDto: UnitDto): void;
  update(unitId: number, unitUpdateDto: UnitUpdateDto): void;
  delete(unitId: number): void;
}

export const UNITS_REPOSITORY_TOKEN = 'units-repository-token';

