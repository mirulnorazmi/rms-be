import { IsNotEmpty, IsInt, IsNumber, IsEnum, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaymentStatus } from '../enums/payment-status.enum';

export class PaymentDto {
  @IsInt()
  @IsNotEmpty()
  readonly contract_id: number;

  @IsInt()
  @IsNotEmpty()
  readonly payer_id: number;

  @IsDateString()
  @IsOptional()
  readonly payment_date?: Date;

  @IsDateString()
  @IsNotEmpty()
  readonly due_date: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  readonly amount: number;

  @IsEnum(PaymentStatus)
  @IsOptional()
  readonly status?: PaymentStatus;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  readonly payment_method?: string;
}

