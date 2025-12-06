import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { UpdateResult, DeleteResult } from 'typeorm';
import { IProperty } from './interfaces/property.interface';
import { Properties } from './models/properties.model';
import { PropertyDto } from './dto/property.dto';
import { PropertyUpdateDto } from './dto/property-update.dto';
import { PROPERTIES_REPOSITORY_TOKEN } from './repositories/properties.repository.interface';
import { PropertiesTypeOrmRepository } from './repositories/implementations/properties.typeorm.repository';

@Injectable()
export class PropertiesService {
  constructor(
    @Inject(PROPERTIES_REPOSITORY_TOKEN)
    private readonly propertiesRepository: PropertiesTypeOrmRepository,
  ) {}

  public async findAll(): Promise<Properties[]> {
    return await this.propertiesRepository.findAll();
  }

  public async findById(propertyId: number): Promise<Properties> {
    const property = await this.propertiesRepository.findById(propertyId);

    if (!property) {
      throw new NotFoundException(`Property #${propertyId} not found`);
    }

    return property;
  }

  public async findByLandlordId(landlordId: number): Promise<Properties[]> {
    return await this.propertiesRepository.findByLandlordId(landlordId);
  }

  public async findByCity(city: string): Promise<Properties[]> {
    return await this.propertiesRepository.findByCity(city);
  }

  public async create(propertyDto: PropertyDto): Promise<IProperty> {
    try {
      return await this.propertiesRepository.create(propertyDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async update(
    propertyId: number,
    propertyUpdateDto: PropertyUpdateDto,
  ): Promise<UpdateResult> {
    try {
      const property = await this.findById(propertyId);
      if (!property) {
        throw new NotFoundException(`Property #${propertyId} not found`);
      }
      return await this.propertiesRepository.update(propertyId, propertyUpdateDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async delete(propertyId: number): Promise<DeleteResult> {
    const property = await this.findById(propertyId);
    if (!property) {
      throw new NotFoundException(`Property #${propertyId} not found`);
    }
    return await this.propertiesRepository.delete(propertyId);
  }
}

