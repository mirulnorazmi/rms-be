import { PropertyDto } from '../dto/property.dto';
import { PropertyUpdateDto } from '../dto/property-update.dto';

export interface PropertiesRepository {
  findAll(): void;
  findById(propertyId: number): void;
  findByLandlordId(landlordId: number): void;
  findByCity(city: string): void;
  create(propertyDto: PropertyDto): void;
  update(propertyId: number, propertyUpdateDto: PropertyUpdateDto): void;
  delete(propertyId: number): void;
}

export const PROPERTIES_REPOSITORY_TOKEN = 'properties-repository-token';

