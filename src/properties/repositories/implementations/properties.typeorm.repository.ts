import { Properties } from '../../models/properties.model';
import { PropertiesRepository } from '../properties.repository.interface';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { PropertyDto } from '../../dto/property.dto';
import { PropertyUpdateDto } from '../../dto/property-update.dto';
import { IProperty } from '../../interfaces/property.interface';

export class PropertiesTypeOrmRepository implements PropertiesRepository {
  constructor(private readonly propertiesRepository: Repository<Properties>) {}

  public async findAll(): Promise<Properties[]> {
    return await this.propertiesRepository.find({
      relations: ['landlord'],
    });
  }

  public async findById(propertyId: number): Promise<Properties | null> {
    return await this.propertiesRepository.findOne({
      where: { property_id: propertyId },
      relations: ['landlord'],
    });
  }

  public async findByLandlordId(landlordId: number): Promise<Properties[]> {
    return await this.propertiesRepository.find({
      where: { landlord_id: landlordId },
      relations: ['landlord'],
    });
  }

  public async findByCity(city: string): Promise<Properties[]> {
    return await this.propertiesRepository.find({
      where: { city },
      relations: ['landlord'],
    });
  }

  public async create(propertyDto: PropertyDto): Promise<IProperty> {
    return await this.propertiesRepository.save(propertyDto);
  }

  public async update(
    propertyId: number,
    propertyUpdateDto: PropertyUpdateDto,
  ): Promise<UpdateResult> {
    return await this.propertiesRepository.update(
      { property_id: propertyId },
      { ...propertyUpdateDto },
    );
  }

  public async delete(propertyId: number): Promise<DeleteResult> {
    return await this.propertiesRepository.delete({ property_id: propertyId });
  }
}

