import { ContractStatus } from '../enums/contract-status.enum';

export class Contract {
  constructor(
    public contract_id: number,
    public unit_id: number,
    public tenant_id: number,
    public start_date: Date,
    public end_date: Date,
    public security_deposit: number,
    public status: ContractStatus,
  ) {}
}

