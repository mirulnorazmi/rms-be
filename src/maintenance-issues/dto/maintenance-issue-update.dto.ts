import { PartialType } from '@nestjs/swagger';
import { MaintenanceIssueDto } from './maintenance-issue.dto';

export class MaintenanceIssueUpdateDto extends PartialType(MaintenanceIssueDto) {}

