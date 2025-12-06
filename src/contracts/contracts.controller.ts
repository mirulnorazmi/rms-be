import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
  Query,
  Patch,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractDto } from './dto/contract.dto';
import { ContractUpdateDto } from './dto/contract-update.dto';
import { IContract } from './interfaces/contract.interface';
import { ContractStatus } from './enums/contract-status.enum';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';

interface ApiResponseMessage {
  message: string;
  status: number;
}

@ApiTags('contracts')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  @ApiOperation({ summary: 'Find all contracts' })
  @ApiResponse({ status: 200, description: 'Get all contracts' })
  public async findAll(): Promise<IContract[]> {
    return this.contractsService.findAll();
  }

  @Get('/active')
  @ApiOperation({ summary: 'Find all active contracts' })
  @ApiResponse({ status: 200, description: 'Get all active contracts' })
  public async findActiveContracts(): Promise<IContract[]> {
    return this.contractsService.findActiveContracts();
  }

  @Get('/expiring')
  @ApiOperation({ summary: 'Find contracts expiring within specified days' })
  @ApiResponse({ status: 200, description: 'Get expiring contracts' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Days until expiry (default: 30)' })
  public async findExpiringContracts(
    @Query('days') days?: number,
  ): Promise<IContract[]> {
    const daysUntilExpiry = days || 30;
    return this.contractsService.findExpiringContracts(daysUntilExpiry);
  }

  @Get('/:contractId')
  @ApiOperation({ summary: 'Find a contract by id' })
  @ApiResponse({ status: 200, description: 'Get a contract by id' })
  @ApiNotFoundResponse({ description: 'Contract not found' })
  public async findOne(
    @Param('contractId', ParseIntPipe) contractId: number,
  ): Promise<IContract> {
    return this.contractsService.findById(contractId);
  }

  @Get('/unit/:unitId')
  @ApiOperation({ summary: 'Find all contracts by unit id' })
  @ApiResponse({ status: 200, description: 'Get all contracts by unit id' })
  public async findByUnitId(
    @Param('unitId', ParseIntPipe) unitId: number,
  ): Promise<IContract[]> {
    return this.contractsService.findByUnitId(unitId);
  }

  @Get('/tenant/:tenantId')
  @ApiOperation({ summary: 'Find all contracts by tenant id' })
  @ApiResponse({ status: 200, description: 'Get all contracts by tenant id' })
  public async findByTenantId(
    @Param('tenantId', ParseIntPipe) tenantId: number,
  ): Promise<IContract[]> {
    return this.contractsService.findByTenantId(tenantId);
  }

  @Get('/search/status')
  @ApiOperation({ summary: 'Find all contracts by status' })
  @ApiResponse({ status: 200, description: 'Get all contracts by status' })
  @ApiQuery({ name: 'status', required: true, enum: ContractStatus })
  public async findByStatus(
    @Query('status') status: ContractStatus,
  ): Promise<IContract[]> {
    return this.contractsService.findByStatus(status);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new contract' })
  @ApiCreatedResponse({ description: 'Contract created successfully' })
  @ApiBadRequestResponse({ description: 'Contract not created' })
  public async create(@Body() contractDto: ContractDto): Promise<IContract> {
    return this.contractsService.create(contractDto);
  }

  @Put('/:contractId')
  @ApiOperation({ summary: 'Update a contract by id' })
  @ApiResponse({ status: 200, description: 'Update a contract by id' })
  @ApiBadRequestResponse({ description: 'Contract not updated' })
  public async update(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Body() contractUpdateDto: ContractUpdateDto,
  ): Promise<ApiResponseMessage> {
    try {
      await this.contractsService.update(contractId, contractUpdateDto);

      return {
        message: 'Contract updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Contract not updated!');
    }
  }

  @Patch('/:contractId/status')
  @ApiOperation({ summary: 'Update contract status' })
  @ApiResponse({ status: 200, description: 'Contract status updated' })
  @ApiBadRequestResponse({ description: 'Contract status not updated' })
  @ApiQuery({ name: 'status', required: true, enum: ContractStatus })
  public async updateStatus(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Query('status') status: ContractStatus,
  ): Promise<ApiResponseMessage> {
    try {
      await this.contractsService.updateStatus(contractId, status);

      return {
        message: 'Contract status updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Contract status not updated!');
    }
  }

  @Delete('/:contractId')
  @ApiOperation({ summary: 'Delete a contract by id' })
  @ApiResponse({ status: 200, description: 'Delete a contract by id' })
  @ApiNotFoundResponse({ description: 'Contract not found' })
  public async delete(
    @Param('contractId', ParseIntPipe) contractId: number,
  ): Promise<ApiResponseMessage> {
    await this.contractsService.delete(contractId);

    return {
      message: 'Contract deleted successfully!',
      status: HttpStatus.OK,
    };
  }
}

