import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface RentReminderPayload {
  tenant_id: number;
  tenant_name: string;
  tenant_email: string;
  unit_number: string;
  property_address: string;
  amount_due: number;
  due_date: string;
  days_until_due: number;
  currency: string;
}

export interface LindyWebhookResponse {
  success: boolean;
  message?: string;
  error?: string;
}

@Injectable()
export class LindyService {
  private readonly logger = new Logger(LindyService.name);
  private readonly lindyWebhookUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.lindyWebhookUrl = process.env.LINDY_WEBHOOK_URL || '';

    if (!this.lindyWebhookUrl) {
      this.logger.warn(
        'LINDY_WEBHOOK_URL is not set. Rent reminders will not be sent via Lindy.',
      );
    } else {
      this.logger.log('Lindy AI service initialized');
    }
  }

  /**
   * Send rent reminder to Lindy AI agent
   * Lindy will then send an email to the tenant
   */
  async sendRentReminder(payload: RentReminderPayload): Promise<LindyWebhookResponse> {
    if (!this.lindyWebhookUrl) {
      this.logger.warn('Lindy webhook URL not configured. Skipping reminder.');
      return { success: false, error: 'Lindy webhook URL not configured' };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.lindyWebhookUrl, {
          event_type: 'rent_reminder',
          data: {
            tenant_id: payload.tenant_id,
            tenant_name: payload.tenant_name,
            tenant_email: payload.tenant_email,
            unit_number: payload.unit_number,
            property_address: payload.property_address,
            amount_due: payload.amount_due,
            due_date: payload.due_date,
            days_until_due: payload.days_until_due,
            currency: payload.currency,
            reminder_message: this.generateReminderMessage(payload),
          },
          timestamp: new Date().toISOString(),
        }),
      );

      this.logger.log(
        `Rent reminder sent to Lindy for tenant: ${payload.tenant_email}`,
      );

      return { success: true, message: 'Reminder sent successfully' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to send rent reminder via Lindy: ${errorMessage}`,
        errorStack,
      );
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send batch reminders to Lindy
   */
  async sendBatchReminders(
    payloads: RentReminderPayload[],
  ): Promise<{ sent: number; failed: number; results: LindyWebhookResponse[] }> {
    const results: LindyWebhookResponse[] = [];
    let sent = 0;
    let failed = 0;

    for (const payload of payloads) {
      const result = await this.sendRentReminder(payload);
      results.push(result);
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    this.logger.log(`Batch reminders completed: ${sent} sent, ${failed} failed`);
    return { sent, failed, results };
  }

  private generateReminderMessage(payload: RentReminderPayload): string {
    if (payload.days_until_due === 0) {
      return `Dear ${payload.tenant_name}, your rent payment of ${payload.currency} ${payload.amount_due.toFixed(2)} for ${payload.unit_number} at ${payload.property_address} is due TODAY. Please make payment to avoid late fees.`;
    } else if (payload.days_until_due === 1) {
      return `Dear ${payload.tenant_name}, your rent payment of ${payload.currency} ${payload.amount_due.toFixed(2)} for ${payload.unit_number} at ${payload.property_address} is due TOMORROW. Please make payment to avoid late fees.`;
    } else if (payload.days_until_due > 0) {
      return `Dear ${payload.tenant_name}, this is a friendly reminder that your rent payment of ${payload.currency} ${payload.amount_due.toFixed(2)} for ${payload.unit_number} at ${payload.property_address} is due in ${payload.days_until_due} days (${payload.due_date}). Please make payment before the due date.`;
    } else {
      return `Dear ${payload.tenant_name}, your rent payment of ${payload.currency} ${payload.amount_due.toFixed(2)} for ${payload.unit_number} at ${payload.property_address} is OVERDUE by ${Math.abs(payload.days_until_due)} days. Please make payment immediately to avoid additional penalties.`;
    }
  }
}

