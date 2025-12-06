import { Contracts } from '../../models/contracts.model';
import { ContractsRepository } from '../contracts.repository.interface';
import { Repository, UpdateResult, DeleteResult, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ContractDto } from '../../dto/contract.dto';
import { ContractUpdateDto } from '../../dto/contract-update.dto';
import { IContract } from '../../interfaces/contract.interface';
import { ContractStatus } from '../../enums/contract-status.enum';

export class ContractsTypeOrmRepository implements ContractsRepository {
  constructor(private readonly contractsRepository: Repository<Contracts>) {}

  public async findAll(): Promise<Contracts[]> {
    return await this.contractsRepository.find({
      relations: ['unit', 'tenant'],
    });
  }

  public async findById(contractId: number): Promise<Contracts | null> {
    return await this.contractsRepository.findOne({
      where: { contract_id: contractId },
      relations: ['unit', 'tenant'],
    });
  }

  public async findByUnitId(unitId: number): Promise<Contracts[]> {
    return await this.contractsRepository.find({
      where: { unit_id: unitId },
      relations: ['unit', 'tenant'],
    });
  }

  public async findByTenantId(tenantId: number): Promise<Contracts[]> {
    return await this.contractsRepository.find({
      where: { tenant_id: tenantId },
      relations: ['unit', 'tenant'],
    });
  }

  public async findByStatus(status: ContractStatus): Promise<Contracts[]> {
    return await this.contractsRepository.find({
      where: { status },
      relations: ['unit', 'tenant'],
    });
  }

  public async findActiveContracts(): Promise<Contracts[]> {
    return await this.contractsRepository.find({
      where: { status: ContractStatus.ACTIVE },
      relations: ['unit', 'tenant'],
    });
  }

  public async findExpiringContracts(daysUntilExpiry: number): Promise<Contracts[]> {
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + daysUntilExpiry);

    return await this.contractsRepository.find({
      where: {
        status: ContractStatus.ACTIVE,
        end_date: LessThanOrEqual(expiryDate),
      },
      relations: ['unit', 'tenant'],
    });
  }

  public async create(contractDto: ContractDto): Promise<IContract> {
    return await this.contractsRepository.save(contractDto);
  }

  public async update(
    contractId: number,
    contractUpdateDto: ContractUpdateDto,
  ): Promise<UpdateResult> {
    return await this.contractsRepository.update(
      { contract_id: contractId },
      { ...contractUpdateDto },
    );
  }

  public async updateStatus(
    contractId: number,
    status: ContractStatus,
  ): Promise<UpdateResult> {
    return await this.contractsRepository.update(
      { contract_id: contractId },
      { status },
    );
  }

  public async delete(contractId: number): Promise<DeleteResult> {
    return await this.contractsRepository.delete({ contract_id: contractId });
  }
}

