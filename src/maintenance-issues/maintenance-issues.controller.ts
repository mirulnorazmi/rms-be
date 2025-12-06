import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
  Query,
  Patch,
} from '@nestjs/common';
import { MaintenanceIssuesService } from './maintenance-issues.service';
import { MaintenanceIssueDto } from './dto/maintenance-issue.dto';
import { MaintenanceIssueUpdateDto } from './dto/maintenance-issue-update.dto';
import { IMaintenanceIssue } from './interfaces/maintenance-issue.interface';
import { IssueStatus } from './enums/issue-status.enum';
import { IssuePriority } from './enums/issue-priority.enum';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';

interface ApiResponseMessage {
  message: string;
  status: number;
}

interface MarkAsCompletedDto {
  completion_date: Date;
}

@ApiTags('maintenance-issues')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('maintenance-issues')
export class MaintenanceIssuesController {
  constructor(private readonly maintenanceIssuesService: MaintenanceIssuesService) {}

  @Get()
  @ApiOperation({ summary: 'Find all maintenance issues' })
  @ApiResponse({ status: 200, description: 'Get all maintenance issues' })
  public async findAll(): Promise<IMaintenanceIssue[]> {
    return this.maintenanceIssuesService.findAll();
  }

  @Get('/open')
  @ApiOperation({ summary: 'Find all open maintenance issues' })
  @ApiResponse({ status: 200, description: 'Get all open maintenance issues' })
  public async findOpenIssues(): Promise<IMaintenanceIssue[]> {
    return this.maintenanceIssuesService.findOpenIssues();
  }

  @Get('/:issueId')
  @ApiOperation({ summary: 'Find a maintenance issue by id' })
  @ApiResponse({ status: 200, description: 'Get a maintenance issue by id' })
  @ApiNotFoundResponse({ description: 'Maintenance issue not found' })
  public async findOne(
    @Param('issueId', ParseIntPipe) issueId: number,
  ): Promise<IMaintenanceIssue> {
    return this.maintenanceIssuesService.findById(issueId);
  }

  @Get('/unit/:unitId')
  @ApiOperation({ summary: 'Find all maintenance issues by unit id' })
  @ApiResponse({ status: 200, description: 'Get all maintenance issues by unit id' })
  public async findByUnitId(
    @Param('unitId', ParseIntPipe) unitId: number,
  ): Promise<IMaintenanceIssue[]> {
    return this.maintenanceIssuesService.findByUnitId(unitId);
  }

  @Get('/reporter/:reportedById')
  @ApiOperation({ summary: 'Find all maintenance issues by reporter id' })
  @ApiResponse({ status: 200, description: 'Get all maintenance issues by reporter id' })
  public async findByReportedById(
    @Param('reportedById', ParseIntPipe) reportedById: number,
  ): Promise<IMaintenanceIssue[]> {
    return this.maintenanceIssuesService.findByReportedById(reportedById);
  }

  @Get('/search/status')
  @ApiOperation({ summary: 'Find all maintenance issues by status' })
  @ApiResponse({ status: 200, description: 'Get all maintenance issues by status' })
  @ApiQuery({ name: 'status', required: true, enum: IssueStatus })
  public async findByStatus(
    @Query('status') status: IssueStatus,
  ): Promise<IMaintenanceIssue[]> {
    return this.maintenanceIssuesService.findByStatus(status);
  }

  @Get('/search/priority')
  @ApiOperation({ summary: 'Find all maintenance issues by priority' })
  @ApiResponse({ status: 200, description: 'Get all maintenance issues by priority' })
  @ApiQuery({ name: 'priority', required: true, enum: IssuePriority })
  public async findByPriority(
    @Query('priority') priority: IssuePriority,
  ): Promise<IMaintenanceIssue[]> {
    return this.maintenanceIssuesService.findByPriority(priority);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new maintenance issue' })
  @ApiCreatedResponse({ description: 'Maintenance issue created successfully' })
  @ApiBadRequestResponse({ description: 'Maintenance issue not created' })
  public async create(@Body() maintenanceIssueDto: MaintenanceIssueDto): Promise<IMaintenanceIssue> {
    return this.maintenanceIssuesService.create(maintenanceIssueDto);
  }

  @Put('/:issueId')
  @ApiOperation({ summary: 'Update a maintenance issue by id' })
  @ApiResponse({ status: 200, description: 'Update a maintenance issue by id' })
  @ApiBadRequestResponse({ description: 'Maintenance issue not updated' })
  public async update(
    @Param('issueId', ParseIntPipe) issueId: number,
    @Body() maintenanceIssueUpdateDto: MaintenanceIssueUpdateDto,
  ): Promise<ApiResponseMessage> {
    try {
      await this.maintenanceIssuesService.update(issueId, maintenanceIssueUpdateDto);

      return {
        message: 'Maintenance issue updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Maintenance issue not updated!');
    }
  }

  @Patch('/:issueId/status')
  @ApiOperation({ summary: 'Update maintenance issue status' })
  @ApiResponse({ status: 200, description: 'Maintenance issue status updated' })
  @ApiBadRequestResponse({ description: 'Maintenance issue status not updated' })
  @ApiQuery({ name: 'status', required: true, enum: IssueStatus })
  public async updateStatus(
    @Param('issueId', ParseIntPipe) issueId: number,
    @Query('status') status: IssueStatus,
  ): Promise<ApiResponseMessage> {
    try {
      await this.maintenanceIssuesService.updateStatus(issueId, status);

      return {
        message: 'Maintenance issue status updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Maintenance issue status not updated!');
    }
  }

  @Patch('/:issueId/complete')
  @ApiOperation({ summary: 'Mark maintenance issue as completed' })
  @ApiResponse({ status: 200, description: 'Maintenance issue marked as completed' })
  @ApiBadRequestResponse({ description: 'Maintenance issue not marked as completed' })
  public async markAsCompleted(
    @Param('issueId', ParseIntPipe) issueId: number,
    @Body() markAsCompletedDto: MarkAsCompletedDto,
  ): Promise<ApiResponseMessage> {
    try {
      await this.maintenanceIssuesService.markAsCompleted(
        issueId,
        markAsCompletedDto.completion_date,
      );

      return {
        message: 'Maintenance issue marked as completed successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Maintenance issue not marked as completed!');
    }
  }

  @Delete('/:issueId')
  @ApiOperation({ summary: 'Delete a maintenance issue by id' })
  @ApiResponse({ status: 200, description: 'Delete a maintenance issue by id' })
  @ApiNotFoundResponse({ description: 'Maintenance issue not found' })
  public async delete(
    @Param('issueId', ParseIntPipe) issueId: number,
  ): Promise<ApiResponseMessage> {
    await this.maintenanceIssuesService.delete(issueId);

    return {
      message: 'Maintenance issue deleted successfully!',
      status: HttpStatus.OK,
    };
  }
}

