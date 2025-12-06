import { PartialType } from '@nestjs/swagger';
import { UnitDto } from './unit.dto';

export class UnitUpdateDto extends PartialType(UnitDto) {}

