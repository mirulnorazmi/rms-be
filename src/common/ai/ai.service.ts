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

// ==================== AI INSIGHTS INTERFACES ====================

export interface AtRiskTenant {
  tenant_id: number;
  tenant_name: string;
  risk_level: 'high' | 'medium';
  overdue_count: number;
  total_overdue_amount: number;
}

export interface LandlordDashboardData {
  total_collected: number;
  total_pending: number;
  this_month_collected: number;
  this_year_collected: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  total_tenants: number;
  tenants_high_risk: number;
  tenants_medium_risk: number;
  tenants_low_risk: number;
  high_risk_tenants: AtRiskTenant[];
  overdue_payments: number;
  pending_payments: number;
  average_late_days: number;
  open_maintenance_tickets: number;
  currency: string;
}

export interface ClaudeInsight {
  category: 'revenue' | 'vacancy' | 'tenant_risk' | 'payment_behavior';
  title: string;
  prediction: string;
  confidence: 'high' | 'medium' | 'low';
  alert_level: 'info' | 'warning' | 'critical';
  recommendation: string;
  at_risk_tenants?: AtRiskTenant[];
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

  // ==================== LANDLORD DASHBOARD AI INSIGHTS ====================

  /**
   * Generate AI-powered insights for landlord dashboard
   */
  async generateLandlordInsights(
    dashboardData: LandlordDashboardData,
  ): Promise<ClaudeInsight[]> {
    if (!this.client) {
      return this.fallbackInsights(dashboardData);
    }

    try {
      const prompt = this.buildInsightsPrompt(dashboardData);

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        return this.fallbackInsights(dashboardData);
      }

      try {
        const insights = JSON.parse(textContent.text.trim());
        if (Array.isArray(insights)) {
          return insights as ClaudeInsight[];
        }
        return this.fallbackInsights(dashboardData);
      } catch {
        return this.fallbackInsights(dashboardData);
      }
    } catch (error) {
      this.logger.error('Claude AI insights generation failed', error);
      return this.fallbackInsights(dashboardData);
    }
  }

  private buildInsightsPrompt(data: LandlordDashboardData): string {
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    // Format high-risk tenants for the prompt
    const highRiskTenantsList = data.high_risk_tenants.length > 0
      ? data.high_risk_tenants.map(t => 
          `  - ${t.tenant_name} (ID: ${t.tenant_id}): ${t.overdue_count} overdue payment(s), ${data.currency} ${t.total_overdue_amount.toFixed(2)} outstanding`
        ).join('\n')
      : '  None';

    return `You are an AI property management advisor. Analyze the following landlord dashboard data and provide predictive insights.

CURRENT DATA (${currentMonth}):
- Total Rent Collected: ${data.currency} ${data.total_collected.toFixed(2)}
- Total Rent Pending: ${data.currency} ${data.total_pending.toFixed(2)}
- This Month Collected: ${data.currency} ${data.this_month_collected.toFixed(2)}
- This Year Collected: ${data.currency} ${data.this_year_collected.toFixed(2)}

OCCUPANCY:
- Total Units: ${data.total_units}
- Occupied Units: ${data.occupied_units}
- Vacant Units: ${data.vacant_units}
- Occupancy Rate: ${data.total_units > 0 ? ((data.occupied_units / data.total_units) * 100).toFixed(1) : 0}%

TENANT RISK DISTRIBUTION:
- Total Tenants: ${data.total_tenants}
- High Risk: ${data.tenants_high_risk}
- Medium Risk: ${data.tenants_medium_risk}
- Low Risk: ${data.tenants_low_risk}

HIGH-RISK TENANTS DETAILS:
${highRiskTenantsList}

PAYMENT BEHAVIOR:
- Overdue Payments: ${data.overdue_payments}
- Pending Payments: ${data.pending_payments}
- Average Late Days: ${data.average_late_days}

MAINTENANCE:
- Open Tickets: ${data.open_maintenance_tickets}

Generate exactly 4 insights (one for each category) as a JSON array. Each insight must follow this structure:
{
  "category": "revenue" | "vacancy" | "tenant_risk" | "payment_behavior",
  "title": "short title",
  "prediction": "detailed prediction based on data, for tenant_risk include specific tenant names and IDs",
  "confidence": "high" | "medium" | "low",
  "alert_level": "info" | "warning" | "critical",
  "recommendation": "actionable recommendation mentioning specific tenants if applicable"
}

Rules:
1. Revenue insight: Predict next month's revenue trend
2. Vacancy insight: Predict vacancy changes and impact
3. Tenant risk insight: MUST mention specific high-risk tenant names and IDs in the prediction
4. Payment behavior insight: Predict payment patterns and potential defaults

Respond with ONLY the JSON array, no markdown or explanation.`;
  }

  private fallbackInsights(data: LandlordDashboardData): ClaudeInsight[] {
    const insights: ClaudeInsight[] = [];

    // Revenue Insight
    const collectionRate = data.total_collected + data.total_pending > 0
      ? (data.total_collected / (data.total_collected + data.total_pending)) * 100
      : 100;
    
    insights.push({
      category: 'revenue',
      title: 'Revenue Forecast',
      prediction: collectionRate >= 90
        ? `Strong collection rate at ${collectionRate.toFixed(1)}%. Expected stable revenue next month.`
        : collectionRate >= 70
        ? `Moderate collection rate at ${collectionRate.toFixed(1)}%. Some revenue at risk.`
        : `Low collection rate at ${collectionRate.toFixed(1)}%. Significant revenue concerns.`,
      confidence: collectionRate >= 90 ? 'high' : collectionRate >= 70 ? 'medium' : 'low',
      alert_level: collectionRate >= 90 ? 'info' : collectionRate >= 70 ? 'warning' : 'critical',
      recommendation: collectionRate >= 90
        ? 'Maintain current collection practices.'
        : 'Consider following up with tenants who have pending payments.',
    });

    // Vacancy Insight
    const occupancyRate = data.total_units > 0 ? (data.occupied_units / data.total_units) * 100 : 100;
    
    insights.push({
      category: 'vacancy',
      title: 'Vacancy Prediction',
      prediction: occupancyRate >= 90
        ? `Excellent occupancy at ${occupancyRate.toFixed(1)}%. Low vacancy risk.`
        : occupancyRate >= 75
        ? `Good occupancy at ${occupancyRate.toFixed(1)}%. ${data.vacant_units} vacant unit(s) need attention.`
        : `Concerning occupancy at ${occupancyRate.toFixed(1)}%. ${data.vacant_units} vacant unit(s) impacting revenue.`,
      confidence: occupancyRate >= 90 ? 'high' : 'medium',
      alert_level: occupancyRate >= 90 ? 'info' : occupancyRate >= 75 ? 'warning' : 'critical',
      recommendation: data.vacant_units > 0
        ? `Focus on filling ${data.vacant_units} vacant unit(s). Consider marketing or pricing adjustments.`
        : 'All units occupied. Monitor lease renewals.',
    });

    // Tenant Risk Insight - Include specific tenant names and IDs
    const highRiskPercentage = data.total_tenants > 0 ? (data.tenants_high_risk / data.total_tenants) * 100 : 0;
    
    // Build tenant names list for prediction
    const tenantNamesList = data.high_risk_tenants.length > 0
      ? data.high_risk_tenants.map(t => `${t.tenant_name} (ID: ${t.tenant_id})`).join(', ')
      : '';

    const tenantRecommendation = data.high_risk_tenants.length > 0
      ? `Review payment history for: ${data.high_risk_tenants.map(t => `${t.tenant_name} (ID: ${t.tenant_id}) - ${data.currency} ${t.total_overdue_amount.toFixed(2)} overdue`).join('; ')}. Consider payment plans or early intervention.`
      : 'Continue monitoring tenant payment patterns.';

    insights.push({
      category: 'tenant_risk',
      title: 'Tenant Risk Alert',
      prediction: data.tenants_high_risk === 0
        ? 'All tenants showing healthy payment patterns. Low default risk.'
        : data.tenants_high_risk === 1
        ? `1 tenant flagged as high risk (${highRiskPercentage.toFixed(1)}%): ${tenantNamesList}. Monitor closely.`
        : `${data.tenants_high_risk} tenants flagged as high risk (${highRiskPercentage.toFixed(1)}%): ${tenantNamesList}. Potential payment issues ahead.`,
      confidence: data.tenants_high_risk === 0 ? 'high' : 'medium',
      alert_level: data.tenants_high_risk === 0 ? 'info' : data.tenants_high_risk <= 2 ? 'warning' : 'critical',
      recommendation: tenantRecommendation,
      at_risk_tenants: data.high_risk_tenants.length > 0 ? data.high_risk_tenants : undefined,
    });

    // Payment Behavior Insight
    const overdueRatio = data.overdue_payments + data.pending_payments > 0
      ? data.overdue_payments / (data.overdue_payments + data.pending_payments)
      : 0;
    
    insights.push({
      category: 'payment_behavior',
      title: 'Payment Behavior Forecast',
      prediction: data.overdue_payments === 0 && data.average_late_days <= 3
        ? 'Excellent payment behavior. Tenants paying on time.'
        : data.overdue_payments <= 2 && data.average_late_days <= 7
        ? `${data.overdue_payments} overdue payment(s). Average ${data.average_late_days} days late. Manageable situation.`
        : `${data.overdue_payments} overdue payment(s). Average ${data.average_late_days} days late. Intervention recommended.`,
      confidence: data.overdue_payments === 0 ? 'high' : 'medium',
      alert_level: data.overdue_payments === 0 ? 'info' : data.overdue_payments <= 2 ? 'warning' : 'critical',
      recommendation: data.overdue_payments > 0
        ? `Send payment reminders to ${data.overdue_payments} tenant(s) with overdue payments.`
        : 'Payment patterns healthy. No immediate action needed.',
    });

    return insights;
  }
}

