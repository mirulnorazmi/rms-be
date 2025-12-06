import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceIssues } from './models/maintenance-issues.model';
import { MaintenanceIssuesService } from './maintenance-issues.service';
import { MaintenanceIssuesController } from './maintenance-issues.controller';
import { provideMaintenanceIssuesRepository } from './repositories/maintenance-issues.repository.provider';
import { ClaudeModule } from '../common/claude/claude.module';
import { StorageModule } from '../common/storage/storage.module';
import { MulterModule } from '@nestjs/platform-express';
import { StorageService } from '../common/storage/storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceIssues]),
    ClaudeModule,
    StorageModule,
    MulterModule.registerAsync({
      imports: [StorageModule],
      useFactory: async (storageService: StorageService) => storageService.getMulterConfig(),
      inject: [StorageService],
    }),
  ],
  controllers: [MaintenanceIssuesController],
  providers: [MaintenanceIssuesService, ...provideMaintenanceIssuesRepository()],
  exports: [MaintenanceIssuesService],
})
export class MaintenanceIssuesModule {}

