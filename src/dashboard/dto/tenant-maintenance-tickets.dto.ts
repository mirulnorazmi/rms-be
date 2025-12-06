import { ApiProperty } from '@nestjs/swagger';
import { IssueStatus } from '../../maintenance-issues/enums/issue-status.enum';
import { IssuePriority } from '../../maintenance-issues/enums/issue-priority.enum';

export class TicketSummaryDto {
  @ApiProperty({ description: 'Number of open tickets' })
  no_open_tickets: number;

  @ApiProperty({ description: 'Number of in-progress tickets' })
  no_inprogress_tickets: number;

  @ApiProperty({ description: 'Number of resolved tickets' })
  no_resolved_tickets: number;
}

export class TicketTableItemDto {
  @ApiProperty({ description: 'Formatted ticket ID (e.g., TKT-2023-105)' })
  ticket_id: string;

  @ApiProperty({ description: 'Original database issue ID' })
  issue_id: number;

  @ApiProperty({ description: 'Ticket title' })
  ticket_title: string;

  @ApiProperty({ description: 'Issue category' })
  category: string;

  @ApiProperty({ enum: IssueStatus, description: 'Ticket status' })
  status: IssueStatus;

  @ApiProperty({ enum: IssuePriority, description: 'Ticket priority' })
  priority: IssuePriority;

  @ApiProperty({ description: 'Date ticket was created' })
  created_date: Date;
}

export class TenantMaintenanceTicketsDto {
  @ApiProperty({ type: TicketSummaryDto })
  summary: TicketSummaryDto;

  @ApiProperty({ type: [TicketTableItemDto] })
  tickets: TicketTableItemDto[];
}

// For single ticket details
export class TicketActivityLogDto {
  @ApiProperty()
  activity_id: number;

  @ApiProperty()
  activity_type: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  performed_by: string;

  @ApiProperty()
  created_at: Date;
}

export class TicketDetailsDto {
  @ApiProperty({ description: 'Formatted ticket ID' })
  ticket_id: string;

  @ApiProperty({ description: 'Original database issue ID' })
  issue_id: number;

  @ApiProperty()
  ticket_title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  category: string;

  @ApiProperty({ enum: IssueStatus })
  status: IssueStatus;

  @ApiProperty({ enum: IssuePriority })
  priority: IssuePriority;

  @ApiProperty()
  created_date: Date;

  @ApiProperty({ nullable: true })
  completion_date: Date | null;

  @ApiProperty()
  unit_number: string;

  @ApiProperty()
  property_address: string;

  @ApiProperty({ nullable: true })
  image_path: string | null;

  @ApiProperty({ type: [TicketActivityLogDto] })
  timeline: TicketActivityLogDto[];
}

