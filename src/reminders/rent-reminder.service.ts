import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Payments } from '../payments/models/payments.model';
import { Contracts } from '../contracts/models/contracts.model';
import { PaymentStatus } from '../payments/enums/payment-status.enum';
import { ContractStatus } from '../contracts/enums/contract-status.enum';
import { LindyService, RentReminderPayload } from '../common/lindy/lindy.service';

@Injectable()
export class RentReminderService {
  private readonly logger = new Logger(RentReminderService.name);

  // Configure reminder days (days before due date to send reminder)
  private readonly reminderDays = [7, 3, 1, 0]; // 7 days, 3 days, 1 day, and on due date

  constructor(
    @InjectRepository(Payments)
    private readonly paymentsRepository: Repository<Payments>,
    @InjectRepository(Contracts)
    private readonly contractsRepository: Repository<Contracts>,
    private readonly lindyService: LindyService,
  ) {}

  /**
   * Scheduled job - runs every day at 9:00 AM
   * Checks for pending payments and sends reminders via Lindy
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleDailyRentReminders(): Promise<void> {
    this.logger.log('Starting daily rent reminder check...');

    try {
      const reminders = await this.getPendingRentReminders();
      
      if (reminders.length === 0) {
        this.logger.log('No rent reminders to send today.');
        return;
      }

      this.logger.log(`Found ${reminders.length} tenants requiring reminders`);

      const result = await this.lindyService.sendBatchReminders(reminders);
      
      this.logger.log(
        `Daily reminders completed: ${result.sent} sent, ${result.failed} failed`,
      );
    } catch (error: unknown) {
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Failed to process daily rent reminders', errorStack);
    }
  }

  /**
   * Get all pending payments that need reminders
   */
  async getPendingRentReminders(): Promise<RentReminderPayload[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminders: RentReminderPayload[] = [];

    // Check for each reminder day
    for (const daysBeforeDue of this.reminderDays) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + daysBeforeDue);

      // Find pending payments due on target date
      const payments = await this.paymentsRepository.find({
        where: {
          status: In([PaymentStatus.PENDING, PaymentStatus.OVERDUE]),
          due_date: Between(
            new Date(targetDate.setHours(0, 0, 0, 0)),
            new Date(targetDate.setHours(23, 59, 59, 999)),
          ),
        },
        relations: ['contract', 'contract.tenant', 'contract.unit', 'contract.unit.property'],
      });

      for (const payment of payments) {
        const contract = payment.contract;
        const tenant = contract?.tenant;
        const unit = contract?.unit;
        const property = unit?.property;

        if (!tenant || !unit || !property) {
          continue;
        }

        // Only send for active contracts
        if (contract.status !== ContractStatus.ACTIVE) {
          continue;
        }

        const dueDate = new Date(payment.due_date);
        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );

        reminders.push({
          tenant_id: tenant.user_id,
          tenant_name: `${tenant.first_name} ${tenant.last_name}`,
          tenant_email: tenant.email,
          unit_number: unit.unit_number,
          property_address: property.address,
          amount_due: Number(payment.amount),
          due_date: dueDate.toISOString().split('T')[0],
          days_until_due: daysUntilDue,
          currency: 'RM',
        });
      }
    }

    // Also check for overdue payments (negative days)
    const overduePayments = await this.paymentsRepository.find({
      where: {
        status: PaymentStatus.OVERDUE,
      },
      relations: ['contract', 'contract.tenant', 'contract.unit', 'contract.unit.property'],
    });

    for (const payment of overduePayments) {
      const contract = payment.contract;
      const tenant = contract?.tenant;
      const unit = contract?.unit;
      const property = unit?.property;

      if (!tenant || !unit || !property || contract.status !== ContractStatus.ACTIVE) {
        continue;
      }

      const dueDate = new Date(payment.due_date);
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Only include if not already in reminders and overdue by specific days (1, 3, 7 days)
      const overdueDays = Math.abs(daysUntilDue);
      if ([1, 3, 7].includes(overdueDays)) {
        const alreadyIncluded = reminders.some(
          (r) => r.tenant_id === tenant.user_id && r.due_date === dueDate.toISOString().split('T')[0],
        );

        if (!alreadyIncluded) {
          reminders.push({
            tenant_id: tenant.user_id,
            tenant_name: `${tenant.first_name} ${tenant.last_name}`,
            tenant_email: tenant.email,
            unit_number: unit.unit_number,
            property_address: property.address,
            amount_due: Number(payment.amount),
            due_date: dueDate.toISOString().split('T')[0],
            days_until_due: daysUntilDue,
            currency: 'RM',
          });
        }
      }
    }

    return reminders;
  }

  /**
   * Manually trigger reminders (for testing or admin use)
   */
  async triggerManualReminders(): Promise<{
    sent: number;
    failed: number;
    reminders: RentReminderPayload[];
  }> {
    const reminders = await this.getPendingRentReminders();
    
    if (reminders.length === 0) {
      return { sent: 0, failed: 0, reminders: [] };
    }

    const result = await this.lindyService.sendBatchReminders(reminders);
    
    return {
      sent: result.sent,
      failed: result.failed,
      reminders,
    };
  }

  /**
   * Send a single reminder for a specific payment
   */
  async sendSingleReminder(paymentId: number): Promise<{ success: boolean; message: string }> {
    const payment = await this.paymentsRepository.findOne({
      where: { payment_id: paymentId },
      relations: ['contract', 'contract.tenant', 'contract.unit', 'contract.unit.property'],
    });

    if (!payment) {
      return { success: false, message: 'Payment not found' };
    }

    const contract = payment.contract;
    const tenant = contract?.tenant;
    const unit = contract?.unit;
    const property = unit?.property;

    if (!tenant || !unit || !property) {
      return { success: false, message: 'Incomplete payment data' };
    }

    const today = new Date();
    const dueDate = new Date(payment.due_date);
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    const payload: RentReminderPayload = {
      tenant_id: tenant.user_id,
      tenant_name: `${tenant.first_name} ${tenant.last_name}`,
      tenant_email: tenant.email,
      unit_number: unit.unit_number,
      property_address: property.address,
      amount_due: Number(payment.amount),
      due_date: dueDate.toISOString().split('T')[0],
      days_until_due: daysUntilDue,
      currency: 'RM',
    };

    const result = await this.lindyService.sendRentReminder(payload);
    
    return {
      success: result.success,
      message: result.success ? 'Reminder sent successfully' : result.error || 'Failed to send reminder',
    };
  }
}

