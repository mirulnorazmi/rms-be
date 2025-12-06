import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { UpdateResult, DeleteResult } from 'typeorm';
import { IMaintenanceIssue } from './interfaces/maintenance-issue.interface';
import { MaintenanceIssues } from './models/maintenance-issues.model';
import { MaintenanceIssueDto } from './dto/maintenance-issue.dto';
import { MaintenanceIssueUpdateDto } from './dto/maintenance-issue-update.dto';
import { IssueStatus } from './enums/issue-status.enum';
import { IssuePriority } from './enums/issue-priority.enum';
import { MAINTENANCE_ISSUES_REPOSITORY_TOKEN } from './repositories/maintenance-issues.repository.interface';
import { MaintenanceIssuesTypeOrmRepository } from './repositories/implementations/maintenance-issues.typeorm.repository';

@Injectable()
export class MaintenanceIssuesService {
  constructor(
    @Inject(MAINTENANCE_ISSUES_REPOSITORY_TOKEN)
    private readonly maintenanceIssuesRepository: MaintenanceIssuesTypeOrmRepository,
  ) {}

  public async findAll(): Promise<MaintenanceIssues[]> {
    return await this.maintenanceIssuesRepository.findAll();
  }

  public async findById(issueId: number): Promise<MaintenanceIssues> {
    const issue = await this.maintenanceIssuesRepository.findById(issueId);

    if (!issue) {
      throw new NotFoundException(`Maintenance Issue #${issueId} not found`);
    }

    return issue;
  }

  public async findByUnitId(unitId: number): Promise<MaintenanceIssues[]> {
    return await this.maintenanceIssuesRepository.findByUnitId(unitId);
  }

  public async findByReportedById(reportedById: number): Promise<MaintenanceIssues[]> {
    return await this.maintenanceIssuesRepository.findByReportedById(reportedById);
  }

  public async findByStatus(status: IssueStatus): Promise<MaintenanceIssues[]> {
    return await this.maintenanceIssuesRepository.findByStatus(status);
  }

  public async findByPriority(priority: IssuePriority): Promise<MaintenanceIssues[]> {
    return await this.maintenanceIssuesRepository.findByPriority(priority);
  }

  public async findOpenIssues(): Promise<MaintenanceIssues[]> {
    return await this.maintenanceIssuesRepository.findOpenIssues();
  }

  public async create(maintenanceIssueDto: MaintenanceIssueDto): Promise<IMaintenanceIssue> {
    try {
      return await this.maintenanceIssuesRepository.create(maintenanceIssueDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async update(
    issueId: number,
    maintenanceIssueUpdateDto: MaintenanceIssueUpdateDto,
  ): Promise<UpdateResult> {
    try {
      const issue = await this.findById(issueId);
      if (!issue) {
        throw new NotFoundException(`Maintenance Issue #${issueId} not found`);
      }
      return await this.maintenanceIssuesRepository.update(issueId, maintenanceIssueUpdateDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updateStatus(
    issueId: number,
    status: IssueStatus,
  ): Promise<UpdateResult> {
    try {
      const issue = await this.findById(issueId);
      if (!issue) {
        throw new NotFoundException(`Maintenance Issue #${issueId} not found`);
      }
      return await this.maintenanceIssuesRepository.updateStatus(issueId, status);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async markAsCompleted(
    issueId: number,
    completionDate: Date,
  ): Promise<UpdateResult> {
    try {
      const issue = await this.findById(issueId);
      if (!issue) {
        throw new NotFoundException(`Maintenance Issue #${issueId} not found`);
      }
      return await this.maintenanceIssuesRepository.markAsCompleted(issueId, completionDate);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async delete(issueId: number): Promise<DeleteResult> {
    const issue = await this.findById(issueId);
    if (!issue) {
      throw new NotFoundException(`Maintenance Issue #${issueId} not found`);
    }
    return await this.maintenanceIssuesRepository.delete(issueId);
  }
}

