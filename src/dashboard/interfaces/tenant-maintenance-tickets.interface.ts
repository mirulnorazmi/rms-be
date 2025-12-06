import { IssueStatus } from '../../maintenance-issues/enums/issue-status.enum';
import { IssuePriority } from '../../maintenance-issues/enums/issue-priority.enum';

export interface ITicketSummary {
  no_open_tickets: number;
  no_inprogress_tickets: number;
  no_resolved_tickets: number;
}

export interface ITicketTableItem {
  ticket_id: string; // Formatted like TKT-2023-105
  issue_id: number; // Original database ID
  ticket_title: string;
  category: string;
  status: IssueStatus;
  priority: IssuePriority;
  created_date: Date;
}

export interface ITenantMaintenanceTickets {
  summary: ITicketSummary;
  tickets: ITicketTableItem[];
}

// For single ticket details
export interface ITicketActivityLog {
  activity_id: number;
  activity_type: string;
  description: string;
  performed_by: string;
  created_at: Date;
}

export interface ITicketDetails {
  ticket_id: string;
  issue_id: number;
  ticket_title: string;
  description: string;
  category: string;
  status: IssueStatus;
  priority: IssuePriority;
  created_date: Date;
  completion_date: Date | null;
  unit_number: string;
  property_address: string;
  image_path: string | null;
  timeline: ITicketActivityLog[];
}

