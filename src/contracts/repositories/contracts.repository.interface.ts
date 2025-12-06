import { ContractDto } from '../dto/contract.dto';
import { ContractUpdateDto } from '../dto/contract-update.dto';
import { ContractStatus } from '../enums/contract-status.enum';

export interface ContractsRepository {
  findAll(): void;
  findById(contractId: number): void;
  findByUnitId(unitId: number): void;
  findByTenantId(tenantId: number): void;
  findByStatus(status: ContractStatus): void;
  findActiveContracts(): void;
  findExpiringContracts(daysUntilExpiry: number): void;
  create(contractDto: ContractDto): void;
  update(contractId: number, contractUpdateDto: ContractUpdateDto): void;
  updateStatus(contractId: number, status: ContractStatus): void;
  delete(contractId: number): void;
}

export const CONTRACTS_REPOSITORY_TOKEN = 'contracts-repository-token';

