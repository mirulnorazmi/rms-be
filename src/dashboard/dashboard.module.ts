import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { TenantDashboardController } from './tenant-dashboard.controller';
import { DashboardService } from './dashboard.service';
import { LandlordGuard } from './guards/landlord.guard';
import { TenantGuard } from './guards/tenant.guard';
import { Properties } from '../properties/models/properties.model';
import { Units } from '../units/models/units.model';
import { Payments } from '../payments/models/payments.model';
import { Contracts } from '../contracts/models/contracts.model';
import { MaintenanceIssues } from '../maintenance-issues/models/maintenance-issues.model';
import { TicketActivityLog } from '../maintenance-issues/models/ticket-activity-log.model';
import { Documents } from '../documents/models/documents.model';
import { UnitDetails } from '../unit-details/models/unit-details.model';
import { UsersModule } from '../users/users.module';
import { AiModule } from '../common/ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Properties, Units, Payments, Contracts, MaintenanceIssues, TicketActivityLog, Documents, UnitDetails]),
    UsersModule,
    AiModule,
  ],
  controllers: [DashboardController, TenantDashboardController],
  providers: [DashboardService, LandlordGuard, TenantGuard],
  exports: [DashboardService],
})
export class DashboardModule {}

