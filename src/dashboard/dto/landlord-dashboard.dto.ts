import { ApiProperty } from '@nestjs/swagger';
import { IssuePriority } from '../../maintenance-issues/enums/issue-priority.enum';
import { TenantPaymentStatus } from '../enums/tenant-payment-status.enum';
import { TenantRiskStatus } from '../enums/tenant-risk-status.enum';
import { ContractStatus } from '../../contracts/enums/contract-status.enum';

export class RentCollectionDto {
  total_collected: number;
  total_pending: number;
  this_month_rent_collected: number;
  this_year_rent_collected: number;
  percentage_collected: number;
  percentage_pending: number;
  currency: string;
}

export class OccupancyRateDto {
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_percentage: number;
}

export class MaintenanceTicketSummaryDto {
  total_open: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  urgent_priority: number;
}

export class MaintenanceTicketItemDto {
  issue_id: number;
  unit_number: string;
  property_address: string;
  title: string;
  priority: IssuePriority;
  reported_date: Date;
}

export class AtRiskTenantDto {
  @ApiProperty({ example: 5, description: 'Tenant user ID' })
  tenant_id: number;

  @ApiProperty({ example: 'John Doe', description: 'Full name of tenant' })
  tenant_name: string;

  @ApiProperty({ enum: ['high', 'medium'], description: 'Risk level' })
  risk_level: 'high' | 'medium';

  @ApiProperty({ example: 3, description: 'Number of overdue payments' })
  overdue_count: number;

  @ApiProperty({ example: 4500.00, description: 'Total overdue amount in RM' })
  total_overdue_amount: number;
}

export class ClaudeInsightDto {
  @ApiProperty({ enum: ['revenue', 'vacancy', 'tenant_risk', 'payment_behavior'] })
  category: 'revenue' | 'vacancy' | 'tenant_risk' | 'payment_behavior';

  @ApiProperty({ example: 'Revenue Forecast' })
  title: string;

  @ApiProperty({ example: 'Strong collection rate at 95%. Expected stable revenue next month.' })
  prediction: string;

  @ApiProperty({ enum: ['high', 'medium', 'low'] })
  confidence: 'high' | 'medium' | 'low';

  @ApiProperty({ enum: ['info', 'warning', 'critical'] })
  alert_level: 'info' | 'warning' | 'critical';

  @ApiProperty({ example: 'Maintain current collection practices.' })
  recommendation: string;

  @ApiProperty({ type: [AtRiskTenantDto], required: false, description: 'List of at-risk tenants (only for tenant_risk category)' })
  at_risk_tenants?: AtRiskTenantDto[];
}

export class LandlordDashboardDto {
  @ApiProperty({ type: RentCollectionDto })
  rent_collection: RentCollectionDto;

  @ApiProperty({ type: OccupancyRateDto })
  occupancy_rate: OccupancyRateDto;

  @ApiProperty({ type: MaintenanceTicketSummaryDto })
  maintenance_summary: MaintenanceTicketSummaryDto;

  @ApiProperty({ type: [MaintenanceTicketItemDto] })
  maintenance_tickets: MaintenanceTicketItemDto[];

  @ApiProperty({ type: [ClaudeInsightDto], description: 'AI-powered predictions and insights' })
  claude_insight: ClaudeInsightDto[];
}

export class LeasePeriodDto {
  start_date: Date;
  end_date: Date;
}

export class LandlordTenantDto {
  tenant_id: number;
  tenant_name: string;
  email: string;
  phone_number: string;
  unit_number: string;
  property_address: string;
  lease_period: LeasePeriodDto;
  status: ContractStatus;
  payment_status: TenantPaymentStatus;
  risk_status: TenantRiskStatus;
}

