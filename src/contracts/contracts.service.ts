import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { UpdateResult, DeleteResult } from 'typeorm';
import { IContract } from './interfaces/contract.interface';
import { Contracts } from './models/contracts.model';
import { ContractDto } from './dto/contract.dto';
import { ContractUpdateDto } from './dto/contract-update.dto';
import { ContractStatus } from './enums/contract-status.enum';
import { CONTRACTS_REPOSITORY_TOKEN } from './repositories/contracts.repository.interface';
import { ContractsTypeOrmRepository } from './repositories/implementations/contracts.typeorm.repository';

@Injectable()
export class ContractsService {
  constructor(
    @Inject(CONTRACTS_REPOSITORY_TOKEN)
    private readonly contractsRepository: ContractsTypeOrmRepository,
  ) {}

  public async findAll(): Promise<Contracts[]> {
    return await this.contractsRepository.findAll();
  }

  public async findById(contractId: number): Promise<Contracts> {
    const contract = await this.contractsRepository.findById(contractId);

    if (!contract) {
      throw new NotFoundException(`Contract #${contractId} not found`);
    }

    return contract;
  }

  public async findByUnitId(unitId: number): Promise<Contracts[]> {
    return await this.contractsRepository.findByUnitId(unitId);
  }

  public async findByTenantId(tenantId: number): Promise<Contracts[]> {
    return await this.contractsRepository.findByTenantId(tenantId);
  }

  public async findByStatus(status: ContractStatus): Promise<Contracts[]> {
    return await this.contractsRepository.findByStatus(status);
  }

  public async findActiveContracts(): Promise<Contracts[]> {
    return await this.contractsRepository.findActiveContracts();
  }

  public async findExpiringContracts(daysUntilExpiry: number): Promise<Contracts[]> {
    return await this.contractsRepository.findExpiringContracts(daysUntilExpiry);
  }

  public async create(contractDto: ContractDto): Promise<IContract> {
    try {
      return await this.contractsRepository.create(contractDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async update(
    contractId: number,
    contractUpdateDto: ContractUpdateDto,
  ): Promise<UpdateResult> {
    try {
      const contract = await this.findById(contractId);
      if (!contract) {
        throw new NotFoundException(`Contract #${contractId} not found`);
      }
      return await this.contractsRepository.update(contractId, contractUpdateDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updateStatus(
    contractId: number,
    status: ContractStatus,
  ): Promise<UpdateResult> {
    try {
      const contract = await this.findById(contractId);
      if (!contract) {
        throw new NotFoundException(`Contract #${contractId} not found`);
      }
      return await this.contractsRepository.updateStatus(contractId, status);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async delete(contractId: number): Promise<DeleteResult> {
    const contract = await this.findById(contractId);
    if (!contract) {
      throw new NotFoundException(`Contract #${contractId} not found`);
    }
    return await this.contractsRepository.delete(contractId);
  }
}

