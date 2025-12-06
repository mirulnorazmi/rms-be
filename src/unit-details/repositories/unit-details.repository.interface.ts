import { UpdateResult, DeleteResult } from 'typeorm';
import { UnitDetails } from '../models/unit-details.model';
import { UnitDetailsDto } from '../dto/unit-details.dto';
import { UnitDetailsUpdateDto } from '../dto/unit-details-update.dto';

export interface UnitDetailsRepository {
  findAll(): Promise<UnitDetails[]>;
  findById(unitDetailId: number): Promise<UnitDetails | null>;
  findByUnitId(unitId: number): Promise<UnitDetails[]>;
  create(unitDetailsDto: UnitDetailsDto): Promise<UnitDetails>;
  update(id: number, unitDetailsUpdateDto: UnitDetailsUpdateDto): Promise<UpdateResult>;
  delete(id: number): Promise<DeleteResult>;
}

export const UNIT_DETAILS_REPOSITORY_TOKEN = 'unit-details-repository-token';

