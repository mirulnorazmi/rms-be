import { Payments } from '../../models/payments.model';
import { PaymentsRepository } from '../payments.repository.interface';
import { Repository, UpdateResult, DeleteResult, LessThan } from 'typeorm';
import { PaymentDto } from '../../dto/payment.dto';
import { PaymentUpdateDto } from '../../dto/payment-update.dto';
import { IPayment } from '../../interfaces/payment.interface';
import { PaymentStatus } from '../../enums/payment-status.enum';

export class PaymentsTypeOrmRepository implements PaymentsRepository {
  constructor(private readonly paymentsRepository: Repository<Payments>) {}

  public async findAll(): Promise<Payments[]> {
    return await this.paymentsRepository.find({
      relations: ['contract', 'payer'],
      order: { due_date: 'DESC' },
    });
  }

  public async findById(paymentId: number): Promise<Payments | null> {
    return await this.paymentsRepository.findOne({
      where: { payment_id: paymentId },
      relations: ['contract', 'payer'],
    });
  }

  public async findByContractId(contractId: number): Promise<Payments[]> {
    return await this.paymentsRepository.find({
      where: { contract_id: contractId },
      relations: ['contract', 'payer'],
      order: { due_date: 'DESC' },
    });
  }

  public async findByPayerId(payerId: number): Promise<Payments[]> {
    return await this.paymentsRepository.find({
      where: { payer_id: payerId },
      relations: ['contract', 'payer'],
      order: { due_date: 'DESC' },
    });
  }

  public async findByStatus(status: PaymentStatus): Promise<Payments[]> {
    return await this.paymentsRepository.find({
      where: { status },
      relations: ['contract', 'payer'],
      order: { due_date: 'DESC' },
    });
  }

  public async findOverduePayments(): Promise<Payments[]> {
    const today = new Date();
    return await this.paymentsRepository.find({
      where: {
        status: PaymentStatus.PENDING,
        due_date: LessThan(today),
      },
      relations: ['contract', 'payer'],
      order: { due_date: 'ASC' },
    });
  }

  public async findPendingPayments(): Promise<Payments[]> {
    return await this.paymentsRepository.find({
      where: { status: PaymentStatus.PENDING },
      relations: ['contract', 'payer'],
      order: { due_date: 'ASC' },
    });
  }

  public async create(paymentDto: PaymentDto): Promise<IPayment> {
    return await this.paymentsRepository.save(paymentDto);
  }

  public async update(
    paymentId: number,
    paymentUpdateDto: PaymentUpdateDto,
  ): Promise<UpdateResult> {
    return await this.paymentsRepository.update(
      { payment_id: paymentId },
      { ...paymentUpdateDto },
    );
  }

  public async updateStatus(
    paymentId: number,
    status: PaymentStatus,
  ): Promise<UpdateResult> {
    return await this.paymentsRepository.update(
      { payment_id: paymentId },
      { status },
    );
  }

  public async markAsPaid(
    paymentId: number,
    paymentDate: Date,
    paymentMethod: string,
  ): Promise<UpdateResult> {
    return await this.paymentsRepository.update(
      { payment_id: paymentId },
      {
        status: PaymentStatus.PAID,
        payment_date: paymentDate,
        payment_method: paymentMethod,
      },
    );
  }

  public async delete(paymentId: number): Promise<DeleteResult> {
    return await this.paymentsRepository.delete({ payment_id: paymentId });
  }
}

