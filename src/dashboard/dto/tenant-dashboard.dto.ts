import { RentStatus } from '../enums/rent-status.enum';
import { IssueStatus } from '../../maintenance-issues/enums/issue-status.enum';

export class RentOverviewDto {
  current_month: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
}

export class MaintenanceTicketCountDto {
  open_tickets: number;
  in_progress_tickets: number;
  closed_tickets: number;
}

export class MaintenanceTicketTableItemDto {
  ticket_id: number;
  title: string;
  date: Date;
  status: IssueStatus;
  has_new_response: boolean;
}

export class LeaseInfoDto {
  property_address: string;
  unit_number: string;
  lease_start_date: Date;
  lease_end_date: Date;
  renewal_date: Date;
}

export class MessageDto {
  type: 'rent_due' | 'rent_paid' | 'ticket_response' | 'ticket_no_response';
  message: string;
  date?: Date;
  ticket_id?: number;
}

export class RecentDocumentDto {
  doc_id: number;
  doc_type: string;
  file_name: string;
  file_path: string;
  file_url: string;
  uploaded_at: Date;
}

export class TenantDashboardDto {
  tenant_id: number;
  tenant_name: string;
  email: string;
  rent_status: RentStatus;
  rent_overview: RentOverviewDto;
  maintenance_ticket_count: MaintenanceTicketCountDto;
  maintenance_tickets: MaintenanceTicketTableItemDto[];
  lease_info: LeaseInfoDto | null;
  messages: MessageDto[];
  recent_documents: RecentDocumentDto[];
}

