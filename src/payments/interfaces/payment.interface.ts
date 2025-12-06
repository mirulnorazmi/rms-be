import { PaymentStatus } from '../enums/payment-status.enum';

export interface IPayment {
  readonly payment_id: number;
  readonly contract_id: number;
  readonly payer_id: number;
  readonly payment_date?: Date;
  readonly due_date: Date;
  readonly amount: number;
  readonly status: PaymentStatus;
  readonly payment_method?: string;
}

