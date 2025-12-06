import { IssueStatus } from '../enums/issue-status.enum';
import { IssuePriority } from '../enums/issue-priority.enum';

export interface IMaintenanceIssue {
  readonly issue_id: number;
  readonly unit_id: number;
  readonly reported_by_id: number;
  readonly status: IssueStatus;
  readonly title: string;
  readonly description: string;
  readonly priority: IssuePriority;
  readonly reported_date: Date;
  readonly completion_date?: Date;
  readonly image_path?: string;
}

