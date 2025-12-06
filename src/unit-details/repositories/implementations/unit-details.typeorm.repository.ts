import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { UnitDetails } from '../../models/unit-details.model';
import { UnitDetailsRepository } from '../unit-details.repository.interface';
import { UnitDetailsDto } from '../../dto/unit-details.dto';
import { UnitDetailsUpdateDto } from '../../dto/unit-details-update.dto';

export class UnitDetailsTypeOrmRepository implements UnitDetailsRepository {
  constructor(private readonly unitDetailsRepository: Repository<UnitDetails>) {}

  public async findAll(): Promise<UnitDetails[]> {
    return await this.unitDetailsRepository.find({
      relations: ['unit'],
    });
  }

  public async findById(unitDetailId: number): Promise<UnitDetails | null> {
    return await this.unitDetailsRepository.findOne({
      where: { unit_detail_id: unitDetailId },
      relations: ['unit'],
    });
  }

  public async findByUnitId(unitId: number): Promise<UnitDetails[]> {
    return await this.unitDetailsRepository.find({
      where: { unit_id: unitId },
      relations: ['unit'],
    });
  }

  public async create(unitDetailsDto: UnitDetailsDto): Promise<UnitDetails> {
    return await this.unitDetailsRepository.save(unitDetailsDto);
  }

  public async update(
    id: number,
    unitDetailsUpdateDto: UnitDetailsUpdateDto,
  ): Promise<UpdateResult> {
    return await this.unitDetailsRepository.update(
      { unit_detail_id: id },
      { ...unitDetailsUpdateDto },
    );
  }

  public async delete(id: number): Promise<DeleteResult> {
    return await this.unitDetailsRepository.delete({ unit_detail_id: id });
  }
}

