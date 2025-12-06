import { PaymentStatus } from '../enums/payment-status.enum';

export class Payment {
  constructor(
    public payment_id: number,
    public contract_id: number,
    public payer_id: number,
    public payment_date: Date,
    public due_date: Date,
    public amount: number,
    public status: PaymentStatus,
    public payment_method: string,
  ) {}
}

