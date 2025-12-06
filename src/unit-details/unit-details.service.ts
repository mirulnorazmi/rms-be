import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { UpdateResult, DeleteResult } from 'typeorm';
import { UnitDetails } from './models/unit-details.model';
import { UnitDetailsDto } from './dto/unit-details.dto';
import { UnitDetailsUpdateDto } from './dto/unit-details-update.dto';
import {
  UNIT_DETAILS_REPOSITORY_TOKEN,
  UnitDetailsRepository,
} from './repositories/unit-details.repository.interface';

@Injectable()
export class UnitDetailsService {
  constructor(
    @Inject(UNIT_DETAILS_REPOSITORY_TOKEN)
    private readonly unitDetailsRepository: UnitDetailsRepository,
  ) {}

  public async findAll(): Promise<UnitDetails[]> {
    return await this.unitDetailsRepository.findAll();
  }

  public async findById(unitDetailId: number): Promise<UnitDetails> {
    const unitDetail = await this.unitDetailsRepository.findById(unitDetailId);

    if (!unitDetail) {
      throw new NotFoundException(`Unit detail #${unitDetailId} not found`);
    }

    return unitDetail;
  }

  public async findByUnitId(unitId: number): Promise<UnitDetails[]> {
    return await this.unitDetailsRepository.findByUnitId(unitId);
  }

  public async create(unitDetailsDto: UnitDetailsDto): Promise<UnitDetails> {
    try {
      return await this.unitDetailsRepository.create(unitDetailsDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async update(
    id: number,
    unitDetailsUpdateDto: UnitDetailsUpdateDto,
  ): Promise<UpdateResult> {
    try {
      const unitDetail = await this.findById(id);
      if (!unitDetail) {
        throw new NotFoundException(`Unit detail #${id} not found`);
      }
      return await this.unitDetailsRepository.update(id, unitDetailsUpdateDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async delete(id: number): Promise<DeleteResult> {
    const unitDetail = await this.findById(id);
    if (!unitDetail) {
      throw new NotFoundException(`Unit detail #${id} not found`);
    }
    return await this.unitDetailsRepository.delete(id);
  }
}

