import { IssueStatus } from '../enums/issue-status.enum';
import { IssuePriority } from '../enums/issue-priority.enum';

export class MaintenanceIssue {
  constructor(
    public issue_id: number,
    public unit_id: number,
    public reported_by_id: number,
    public status: IssueStatus,
    public title: string,
    public description: string,
    public priority: IssuePriority,
    public reported_date: Date,
    public completion_date: Date,
    public image_path: string,
  ) {}
}

