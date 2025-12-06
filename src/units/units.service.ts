import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { UpdateResult, DeleteResult } from 'typeorm';
import { IUnit } from './interfaces/unit.interface';
import { Units } from './models/units.model';
import { UnitDto } from './dto/unit.dto';
import { UnitUpdateDto } from './dto/unit-update.dto';
import { UNITS_REPOSITORY_TOKEN } from './repositories/units.repository.interface';
import { UnitsTypeOrmRepository } from './repositories/implementations/units.typeorm.repository';

@Injectable()
export class UnitsService {
  constructor(
    @Inject(UNITS_REPOSITORY_TOKEN)
    private readonly unitsRepository: UnitsTypeOrmRepository,
  ) {}

  public async findAll(): Promise<Units[]> {
    return await this.unitsRepository.findAll();
  }

  public async findById(unitId: number): Promise<Units> {
    const unit = await this.unitsRepository.findById(unitId);

    if (!unit) {
      throw new NotFoundException(`Unit #${unitId} not found`);
    }

    return unit;
  }

  public async findByPropertyId(propertyId: number): Promise<Units[]> {
    return await this.unitsRepository.findByPropertyId(propertyId);
  }

  public async findByStatus(status: string): Promise<Units[]> {
    return await this.unitsRepository.findByStatus(status);
  }

  public async create(unitDto: UnitDto): Promise<IUnit> {
    try {
      return await this.unitsRepository.create(unitDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async update(
    unitId: number,
    unitUpdateDto: UnitUpdateDto,
  ): Promise<UpdateResult> {
    try {
      const unit = await this.findById(unitId);
      if (!unit) {
        throw new NotFoundException(`Unit #${unitId} not found`);
      }
      return await this.unitsRepository.update(unitId, unitUpdateDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async delete(unitId: number): Promise<DeleteResult> {
    const unit = await this.findById(unitId);
    if (!unit) {
      throw new NotFoundException(`Unit #${unitId} not found`);
    }
    return await this.unitsRepository.delete(unitId);
  }
}

