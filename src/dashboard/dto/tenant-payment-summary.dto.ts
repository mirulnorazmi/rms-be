export class SSTInfoDto {
  rate_percentage: number;
  amount: number;
  description: string;
}

export class UnpaidPaymentSummaryDto {
  status: 'Unpaid';
  base_rent: number;
  sst_info: SSTInfoDto;
  total_payable: number;
  due_date: Date;
  days_until_due: number;
  is_overdue: boolean;
  currency: string;
}

export class PaidPaymentSummaryDto {
  status: 'Paid';
  amount_paid: number;
  payment_date: Date;
  payment_method: string;
  currency: string;
}

export type TenantPaymentSummaryDto = UnpaidPaymentSummaryDto | PaidPaymentSummaryDto;

