import { MaintenanceIssues } from '../../models/maintenance-issues.model';
import { MaintenanceIssuesRepository } from '../maintenance-issues.repository.interface';
import { Repository, UpdateResult, DeleteResult, Not } from 'typeorm';
import { MaintenanceIssueDto } from '../../dto/maintenance-issue.dto';
import { MaintenanceIssueUpdateDto } from '../../dto/maintenance-issue-update.dto';
import { IMaintenanceIssue } from '../../interfaces/maintenance-issue.interface';
import { IssueStatus } from '../../enums/issue-status.enum';
import { IssuePriority } from '../../enums/issue-priority.enum';

export class MaintenanceIssuesTypeOrmRepository implements MaintenanceIssuesRepository {
  constructor(private readonly maintenanceIssuesRepository: Repository<MaintenanceIssues>) {}

  public async findAll(): Promise<MaintenanceIssues[]> {
    return await this.maintenanceIssuesRepository.find({
      relations: ['unit', 'reported_by'],
      order: { reported_date: 'DESC' },
    });
  }

  public async findById(issueId: number): Promise<MaintenanceIssues | null> {
    return await this.maintenanceIssuesRepository.findOne({
      where: { issue_id: issueId },
      relations: ['unit', 'reported_by'],
    });
  }

  public async findByUnitId(unitId: number): Promise<MaintenanceIssues[]> {
    return await this.maintenanceIssuesRepository.find({
      where: { unit_id: unitId },
      relations: ['unit', 'reported_by'],
      order: { reported_date: 'DESC' },
    });
  }

  public async findByReportedById(reportedById: number): Promise<MaintenanceIssues[]> {
    return await this.maintenanceIssuesRepository.find({
      where: { reported_by_id: reportedById },
      relations: ['unit', 'reported_by'],
      order: { reported_date: 'DESC' },
    });
  }

  public async findByStatus(status: IssueStatus): Promise<MaintenanceIssues[]> {
    return await this.maintenanceIssuesRepository.find({
      where: { status },
      relations: ['unit', 'reported_by'],
      order: { reported_date: 'DESC' },
    });
  }

  public async findByPriority(priority: IssuePriority): Promise<MaintenanceIssues[]> {
    return await this.maintenanceIssuesRepository.find({
      where: { priority },
      relations: ['unit', 'reported_by'],
      order: { reported_date: 'DESC' },
    });
  }

  public async findOpenIssues(): Promise<MaintenanceIssues[]> {
    return await this.maintenanceIssuesRepository.find({
      where: { status: Not(IssueStatus.COMPLETED) },
      relations: ['unit', 'reported_by'],
      order: { priority: 'DESC', reported_date: 'ASC' },
    });
  }

  public async create(maintenanceIssueDto: MaintenanceIssueDto): Promise<IMaintenanceIssue> {
    return await this.maintenanceIssuesRepository.save(maintenanceIssueDto);
  }

  public async update(
    issueId: number,
    maintenanceIssueUpdateDto: MaintenanceIssueUpdateDto,
  ): Promise<UpdateResult> {
    return await this.maintenanceIssuesRepository.update(
      { issue_id: issueId },
      { ...maintenanceIssueUpdateDto },
    );
  }

  public async updateStatus(
    issueId: number,
    status: IssueStatus,
  ): Promise<UpdateResult> {
    return await this.maintenanceIssuesRepository.update(
      { issue_id: issueId },
      { status },
    );
  }

  public async markAsCompleted(
    issueId: number,
    completionDate: Date,
  ): Promise<UpdateResult> {
    return await this.maintenanceIssuesRepository.update(
      { issue_id: issueId },
      {
        status: IssueStatus.COMPLETED,
        completion_date: completionDate,
      },
    );
  }

  public async delete(issueId: number): Promise<DeleteResult> {
    return await this.maintenanceIssuesRepository.delete({ issue_id: issueId });
  }
}

