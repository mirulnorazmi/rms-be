import { PartialType } from '@nestjs/swagger';
import { ContractDto } from './contract.dto';

export class ContractUpdateDto extends PartialType(ContractDto) {}

