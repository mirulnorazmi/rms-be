import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceIssues } from './models/maintenance-issues.model';
import { MaintenanceIssuesService } from './maintenance-issues.service';
import { MaintenanceIssuesController } from './maintenance-issues.controller';
import { provideMaintenanceIssuesRepository } from './repositories/maintenance-issues.repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceIssues])],
  controllers: [MaintenanceIssuesController],
  providers: [MaintenanceIssuesService, ...provideMaintenanceIssuesRepository()],
  exports: [MaintenanceIssuesService],
})
export class MaintenanceIssuesModule {}

