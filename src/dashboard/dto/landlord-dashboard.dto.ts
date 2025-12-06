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

export class LandlordDashboardDto {
  rent_collection: RentCollectionDto;
  occupancy_rate: OccupancyRateDto;
  maintenance_summary: MaintenanceTicketSummaryDto;
  maintenance_tickets: MaintenanceTicketItemDto[];
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

