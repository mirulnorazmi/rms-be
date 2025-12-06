import { RentStatus } from '../enums/rent-status.enum';
import { IssueStatus } from '../../maintenance-issues/enums/issue-status.enum';

export interface IRentOverview {
  current_month: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
}

export interface IMaintenanceTicketCount {
  open_tickets: number;
  in_progress_tickets: number;
  closed_tickets: number;
}

export interface IMaintenanceTicketTableItem {
  ticket_id: number;
  title: string;
  date: Date;
  status: IssueStatus;
  has_new_response: boolean;
}

export interface ILeaseInfo {
  property_address: string;
  unit_number: string;
  lease_start_date: Date;
  lease_end_date: Date;
  renewal_date: Date;
}

export interface IMessage {
  type: 'rent_due' | 'rent_paid' | 'ticket_response' | 'ticket_no_response';
  message: string;
  date?: Date;
  ticket_id?: number;
}

export interface IRecentDocument {
  doc_id: number;
  doc_type: string;
  file_name: string;
  file_path: string;
  file_url: string;
  uploaded_at: Date;
}

export interface ITenantDashboard {
  tenant_id: number;
  tenant_name: string;
  email: string;
  rent_status: RentStatus;
  rent_overview: IRentOverview;
  maintenance_ticket_count: IMaintenanceTicketCount;
  maintenance_tickets: IMaintenanceTicketTableItem[];
  lease_info: ILeaseInfo | null;
  messages: IMessage[];
  recent_documents: IRecentDocument[];
}

