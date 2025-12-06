import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { TenantRiskStatus } from '../../dashboard/enums/tenant-risk-status.enum';

export interface TenantPaymentHistory {
  total_payments: number;
  paid_on_time: number;
  paid_late: number;
  overdue: number;
  pending: number;
  average_days_late: number;
  total_amount_due: number;
  total_amount_paid: number;
}

export interface SSTCalculation {
  rate_percentage: number;
  sst_amount: number;
  description: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private client: Anthropic | null = null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
      this.logger.log('Anthropic Claude AI initialized');
    } else {
      this.logger.warn(
        'ANTHROPIC_API_KEY not found. AI risk assessment will use fallback logic.',
      );
    }
  }

  async calculateTenantRiskStatus(
    paymentHistory: TenantPaymentHistory,
  ): Promise<TenantRiskStatus> {
    // If Claude is not configured, use fallback logic
    if (!this.client) {
      return this.fallbackRiskCalculation(paymentHistory);
    }

    try {
      const prompt = this.buildRiskAssessmentPrompt(paymentHistory);
      
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text from response
      const textContent = response.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        return this.fallbackRiskCalculation(paymentHistory);
      }

      const result = textContent.text.trim().toUpperCase();

      // Parse Claude's response
      if (result.includes('HIGH')) {
        return TenantRiskStatus.HIGH;
      } else if (result.includes('MEDIUM')) {
        return TenantRiskStatus.MEDIUM;
      } else {
        return TenantRiskStatus.LOW;
      }
    } catch (error) {
      this.logger.error('Claude AI risk assessment failed', error);
      return this.fallbackRiskCalculation(paymentHistory);
    }
  }

  private buildRiskAssessmentPrompt(history: TenantPaymentHistory): string {
    return `You are a property management risk assessment AI. Based on the tenant's payment history below, determine their risk level.

PAYMENT HISTORY:
- Total Payments: ${history.total_payments}
- Paid On Time: ${history.paid_on_time}
- Paid Late: ${history.paid_late}
- Currently Overdue: ${history.overdue}
- Currently Pending: ${history.pending}
- Average Days Late (when late): ${history.average_days_late}
- Total Amount Due: RM ${history.total_amount_due}
- Total Amount Paid: RM ${history.total_amount_paid}

RISK CRITERIA:
- LOW: Reliable tenant, pays on time, minimal late payments
- MEDIUM: Some payment issues, occasional late payments, but generally manageable
- HIGH: Frequent late payments, multiple overdue, high default risk

Respond with ONLY one word: LOW, MEDIUM, or HIGH`;
  }

  private fallbackRiskCalculation(
    history: TenantPaymentHistory,
  ): TenantRiskStatus {
    // Fallback logic when Claude is not available
    const { total_payments, paid_late, overdue } = history;

    if (total_payments === 0) {
      return TenantRiskStatus.LOW;
    }

    const lateRatio = total_payments > 0 ? paid_late / total_payments : 0;

    if (lateRatio >= 0.5 || overdue >= 3) {
      return TenantRiskStatus.HIGH;
    } else if (lateRatio >= 0.2 || overdue >= 1) {
      return TenantRiskStatus.MEDIUM;
    }

    return TenantRiskStatus.LOW;
  }

  // ==================== SST CALCULATION ====================

  async calculateMalaysianSST(baseRentAmount: number): Promise<SSTCalculation> {
    // If Claude is not configured, use fallback logic
    if (!this.client) {
      return this.fallbackSSTCalculation(baseRentAmount);
    }

    try {
      const prompt = this.buildSSTPrompt(baseRentAmount);
      
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text from response
      const textContent = response.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        return this.fallbackSSTCalculation(baseRentAmount);
      }

      const result = textContent.text.trim();

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(result);
        return {
          rate_percentage: parsed.rate_percentage || 6,
          sst_amount: parsed.sst_amount || baseRentAmount * 0.06,
          description: parsed.description || 'Service Tax (SST) at 6% for rental services in Malaysia',
        };
      } catch {
        // If not valid JSON, use fallback
        return this.fallbackSSTCalculation(baseRentAmount);
      }
    } catch (error) {
      this.logger.error('Claude AI SST calculation failed', error);
      return this.fallbackSSTCalculation(baseRentAmount);
    }
  }

  private buildSSTPrompt(baseRentAmount: number): string {
    const currentYear = new Date().getFullYear();
    
    return `You are a Malaysian tax expert. Calculate the Sales and Service Tax (SST) for a rental property payment.

BASE RENT AMOUNT: RM ${baseRentAmount.toFixed(2)}
CURRENT DATE: ${new Date().toISOString().split('T')[0]}

CONTEXT:
- This is for residential property rental in Malaysia
- Use the current Malaysian SST rate applicable in ${currentYear}
- Consider any recent changes to SST regulations for rental/accommodation services
- Note: The standard service tax rate has been 6% for most services, but verify if this applies to current ${currentYear} regulations

Please respond with ONLY a JSON object in this exact format (no markdown, no explanation):
{"rate_percentage": <number>, "sst_amount": <number>, "description": "<brief description including the applicable year>"}

Example response:
{"rate_percentage": 6, "sst_amount": 90.00, "description": "Service Tax (SST) at 6% for rental services in Malaysia (${currentYear})"}`;
  }

  private fallbackSSTCalculation(baseRentAmount: number): SSTCalculation {
    const currentYear = new Date().getFullYear();
    // Malaysian SST for services - standard rate is 6%
    // Note: This fallback uses a fixed rate. For real-time rates, ensure Claude AI is configured.
    const sstRate = 6;
    const sstAmount = baseRentAmount * (sstRate / 100);

    return {
      rate_percentage: sstRate,
      sst_amount: Math.round(sstAmount * 100) / 100,
      description: `Service Tax (SST) at ${sstRate}% for rental services in Malaysia (${currentYear})`,
    };
  }
}

