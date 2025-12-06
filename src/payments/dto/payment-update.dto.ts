import { PartialType } from '@nestjs/swagger';
import { PaymentDto } from './payment.dto';

export class PaymentUpdateDto extends PartialType(PaymentDto) {}

