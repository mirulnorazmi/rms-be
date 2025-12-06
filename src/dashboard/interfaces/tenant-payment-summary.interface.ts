export interface ISSTInfo {
  rate_percentage: number;
  amount: number;
  description: string;
}

export interface IUnpaidPaymentSummary {
  status: 'Unpaid';
  base_rent: number;
  sst_info: ISSTInfo;
  total_payable: number;
  due_date: Date;
  days_until_due: number;
  is_overdue: boolean;
  currency: string;
}

export interface IPaidPaymentSummary {
  status: 'Paid';
  amount_paid: number;
  payment_date: Date;
  payment_method: string;
  currency: string;
}

export type ITenantPaymentSummary = IUnpaidPaymentSummary | IPaidPaymentSummary;

