import { ContractStatus } from '../enums/contract-status.enum';

export interface IContract {
  readonly contract_id: number;
  readonly unit_id: number;
  readonly tenant_id: number;
  readonly start_date: Date;
  readonly end_date: Date;
  readonly security_deposit: number;
  readonly status: ContractStatus;
}

