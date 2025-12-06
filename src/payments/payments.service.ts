import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { UpdateResult, DeleteResult } from 'typeorm';
import { IPayment } from './interfaces/payment.interface';
import { Payments } from './models/payments.model';
import { PaymentDto } from './dto/payment.dto';
import { PaymentUpdateDto } from './dto/payment-update.dto';
import { PaymentStatus } from './enums/payment-status.enum';
import { PAYMENTS_REPOSITORY_TOKEN } from './repositories/payments.repository.interface';
import { PaymentsTypeOrmRepository } from './repositories/implementations/payments.typeorm.repository';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PAYMENTS_REPOSITORY_TOKEN)
    private readonly paymentsRepository: PaymentsTypeOrmRepository,
  ) {}

  public async findAll(): Promise<Payments[]> {
    return await this.paymentsRepository.findAll();
  }

  public async findById(paymentId: number): Promise<Payments> {
    const payment = await this.paymentsRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException(`Payment #${paymentId} not found`);
    }

    return payment;
  }

  public async findByContractId(contractId: number): Promise<Payments[]> {
    return await this.paymentsRepository.findByContractId(contractId);
  }

  public async findByPayerId(payerId: number): Promise<Payments[]> {
    return await this.paymentsRepository.findByPayerId(payerId);
  }

  public async findByStatus(status: PaymentStatus): Promise<Payments[]> {
    return await this.paymentsRepository.findByStatus(status);
  }

  public async findOverduePayments(): Promise<Payments[]> {
    return await this.paymentsRepository.findOverduePayments();
  }

  public async findPendingPayments(): Promise<Payments[]> {
    return await this.paymentsRepository.findPendingPayments();
  }

  public async create(paymentDto: PaymentDto): Promise<IPayment> {
    try {
      return await this.paymentsRepository.create(paymentDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async update(
    paymentId: number,
    paymentUpdateDto: PaymentUpdateDto,
  ): Promise<UpdateResult> {
    try {
      const payment = await this.findById(paymentId);
      if (!payment) {
        throw new NotFoundException(`Payment #${paymentId} not found`);
      }
      return await this.paymentsRepository.update(paymentId, paymentUpdateDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updateStatus(
    paymentId: number,
    status: PaymentStatus,
  ): Promise<UpdateResult> {
    try {
      const payment = await this.findById(paymentId);
      if (!payment) {
        throw new NotFoundException(`Payment #${paymentId} not found`);
      }
      return await this.paymentsRepository.updateStatus(paymentId, status);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async markAsPaid(
    paymentId: number,
    paymentDate: Date,
    paymentMethod: string,
  ): Promise<UpdateResult> {
    try {
      const payment = await this.findById(paymentId);
      if (!payment) {
        throw new NotFoundException(`Payment #${paymentId} not found`);
      }
      return await this.paymentsRepository.markAsPaid(paymentId, paymentDate, paymentMethod);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async delete(paymentId: number): Promise<DeleteResult> {
    const payment = await this.findById(paymentId);
    if (!payment) {
      throw new NotFoundException(`Payment #${paymentId} not found`);
    }
    return await this.paymentsRepository.delete(paymentId);
  }
}

