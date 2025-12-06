import { MaintenanceIssueDto } from '../dto/maintenance-issue.dto';
import { MaintenanceIssueUpdateDto } from '../dto/maintenance-issue-update.dto';
import { IssueStatus } from '../enums/issue-status.enum';
import { IssuePriority } from '../enums/issue-priority.enum';

export interface MaintenanceIssuesRepository {
  findAll(): void;
  findById(issueId: number): void;
  findByUnitId(unitId: number): void;
  findByReportedById(reportedById: number): void;
  findByStatus(status: IssueStatus): void;
  findByPriority(priority: IssuePriority): void;
  findOpenIssues(): void;
  create(maintenanceIssueDto: MaintenanceIssueDto | any): void;
  update(issueId: number, maintenanceIssueUpdateDto: MaintenanceIssueUpdateDto): void;
  updateStatus(issueId: number, status: IssueStatus): void;
  markAsCompleted(issueId: number, completionDate: Date): void;
  delete(issueId: number): void;
}

export const MAINTENANCE_ISSUES_REPOSITORY_TOKEN = 'maintenance-issues-repository-token';

