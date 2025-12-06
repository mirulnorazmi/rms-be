import { Units } from '../../models/units.model';
import { UnitsRepository } from '../units.repository.interface';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { UnitDto } from '../../dto/unit.dto';
import { UnitUpdateDto } from '../../dto/unit-update.dto';
import { IUnit } from '../../interfaces/unit.interface';

export class UnitsTypeOrmRepository implements UnitsRepository {
  constructor(private readonly unitsRepository: Repository<Units>) {}

  public async findAll(): Promise<Units[]> {
    return await this.unitsRepository.find({
      relations: ['property'],
    });
  }

  public async findById(unitId: number): Promise<Units | null> {
    return await this.unitsRepository.findOne({
      where: { unit_id: unitId },
      relations: ['property'],
    });
  }

  public async findByPropertyId(propertyId: number): Promise<Units[]> {
    return await this.unitsRepository.find({
      where: { property_id: propertyId },
      relations: ['property'],
    });
  }

  public async findByStatus(status: string): Promise<Units[]> {
    return await this.unitsRepository.find({
      where: { status },
      relations: ['property'],
    });
  }

  public async create(unitDto: UnitDto): Promise<IUnit> {
    return await this.unitsRepository.save(unitDto);
  }

  public async update(
    unitId: number,
    unitUpdateDto: UnitUpdateDto,
  ): Promise<UpdateResult> {
    return await this.unitsRepository.update(
      { unit_id: unitId },
      { ...unitUpdateDto },
    );
  }

  public async delete(unitId: number): Promise<DeleteResult> {
    return await this.unitsRepository.delete({ unit_id: unitId });
  }
}

