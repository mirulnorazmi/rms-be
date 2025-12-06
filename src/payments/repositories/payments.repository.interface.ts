import { PaymentDto } from '../dto/payment.dto';
import { PaymentUpdateDto } from '../dto/payment-update.dto';
import { PaymentStatus } from '../enums/payment-status.enum';

export interface PaymentsRepository {
  findAll(): void;
  findById(paymentId: number): void;
  findByContractId(contractId: number): void;
  findByPayerId(payerId: number): void;
  findByStatus(status: PaymentStatus): void;
  findOverduePayments(): void;
  findPendingPayments(): void;
  create(paymentDto: PaymentDto): void;
  update(paymentId: number, paymentUpdateDto: PaymentUpdateDto): void;
  updateStatus(paymentId: number, status: PaymentStatus): void;
  markAsPaid(paymentId: number, paymentDate: Date, paymentMethod: string): void;
  delete(paymentId: number): void;
}

export const PAYMENTS_REPOSITORY_TOKEN = 'payments-repository-token';

