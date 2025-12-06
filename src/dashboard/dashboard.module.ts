import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { LandlordGuard } from './guards/landlord.guard';
import { Properties } from '../properties/models/properties.model';
import { Units } from '../units/models/units.model';
import { Payments } from '../payments/models/payments.model';
import { Contracts } from '../contracts/models/contracts.model';
import { MaintenanceIssues } from '../maintenance-issues/models/maintenance-issues.model';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Properties, Units, Payments, Contracts, MaintenanceIssues]),
    UsersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, LandlordGuard],
  exports: [DashboardService],
})
export class DashboardModule {}

