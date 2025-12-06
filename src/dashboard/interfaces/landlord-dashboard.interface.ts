import { IssuePriority } from '../../maintenance-issues/enums/issue-priority.enum';
import { TenantPaymentStatus } from '../enums/tenant-payment-status.enum';
import { TenantRiskStatus } from '../enums/tenant-risk-status.enum';
import { ContractStatus } from '../../contracts/enums/contract-status.enum';

export interface IRentCollection {
  total_collected: number;
  total_pending: number;
  this_month_rent_collected: number;
  this_year_rent_collected: number;
  percentage_collected: number;
  percentage_pending: number;
  currency: string;
}

export interface IOccupancyRate {
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  occupancy_percentage: number;
}

export interface IMaintenanceTicketSummary {
  total_open: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  urgent_priority: number;
}

export interface IMaintenanceTicketItem {
  issue_id: number;
  unit_number: string;
  property_address: string;
  title: string;
  priority: IssuePriority;
  reported_date: Date;
}

export interface ILandlordDashboard {
  rent_collection: IRentCollection;
  occupancy_rate: IOccupancyRate;
  maintenance_summary: IMaintenanceTicketSummary;
  maintenance_tickets: IMaintenanceTicketItem[];
}

export interface ILeasePeriod {
  start_date: Date;
  end_date: Date;
}

export interface ILandlordTenant {
  tenant_id: number;
  tenant_name: string;
  email: string;
  phone_number: string;
  unit_number: string;
  property_address: string;
  lease_period: ILeasePeriod;
  status: ContractStatus;
  payment_status: TenantPaymentStatus;
  risk_status: TenantRiskStatus;
}

