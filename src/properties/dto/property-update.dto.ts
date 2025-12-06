import { PartialType } from '@nestjs/swagger';
import { PropertyDto } from './property.dto';

export class PropertyUpdateDto extends PartialType(PropertyDto) {}

