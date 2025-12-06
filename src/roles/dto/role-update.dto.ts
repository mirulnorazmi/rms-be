import { PartialType } from '@nestjs/swagger';
import { RoleDto } from './role.dto';

export class RoleUpdateDto extends PartialType(RoleDto) {}

