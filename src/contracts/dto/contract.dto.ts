import { IsNotEmpty, IsInt, IsNumber, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ContractStatus } from '../enums/contract-status.enum';

export class ContractDto {
  @IsInt()
  @IsNotEmpty()
  readonly unit_id: number;

  @IsInt()
  @IsNotEmpty()
  readonly tenant_id: number;

  @IsDateString()
  @IsNotEmpty()
  readonly start_date: Date;

  @IsDateString()
  @IsNotEmpty()
  readonly end_date: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  readonly security_deposit: number;

  @IsEnum(ContractStatus)
  @IsOptional()
  readonly status?: ContractStatus;
}

