import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
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
import { ClaudeService } from '../common/claude/claude.service';
import { CreateMaintenanceIssueDto } from './dto/create-maintenace-issue.dto';

@Injectable()
export class MaintenanceIssuesService {
  private readonly logger = new Logger(MaintenanceIssuesService.name);

  constructor(
    @Inject(MAINTENANCE_ISSUES_REPOSITORY_TOKEN)
    private readonly maintenanceIssuesRepository: MaintenanceIssuesTypeOrmRepository,
    private readonly claudeService: ClaudeService,
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

  async create(
    createDto: CreateMaintenanceIssueDto,
    imagePath?: string,
  ): Promise<MaintenanceIssues> {
    try {
      let description = createDto.description;
      let priority = createDto.priority;
      let category = createDto.category;

      // If image is provided and description is not provided or AI analysis is requested
      if (imagePath && (!description || createDto.useAI)) {
        this.logger.log('Analyzing maintenance issue with Claude AI...');
        
        const analysis = await this.claudeService.analyzeMaintenanceIssue(
          imagePath,
          createDto.title,
          createDto.category,
        );

        // Use AI-generated description if not provided
        if (!description) {
          description = analysis.description;
        }

        // Use AI-generated priority
        priority = analysis.priority;

        // Use AI-suggested category if not provided
        if (!category && analysis.suggestedCategory) {
          category = analysis.suggestedCategory;
        }

        this.logger.log(`AI Analysis - Priority: ${priority}, Category: ${category}`);
      }

      // Create maintenance issue entity
      const maintenanceIssue = {
        unit_id: createDto.unit_id,
        reported_by_id: createDto.reported_by_id,
        title: createDto.title,
        description: description || '',
        status: IssueStatus.NEW,
        priority: priority as IssuePriority,
        category: category,
        image_path: imagePath,
        reported_date: new Date(),
      };

      // Save to database
      return (await this.maintenanceIssuesRepository.create(maintenanceIssue)) as unknown as MaintenanceIssues;
    } catch (error) {
      this.logger.error('Error creating maintenance issue:', error);
      throw error;
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
