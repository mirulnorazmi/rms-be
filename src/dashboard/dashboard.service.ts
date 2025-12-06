import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Properties } from '../properties/models/properties.model';
import { Units } from '../units/models/units.model';
import { Payments } from '../payments/models/payments.model';
import { Contracts } from '../contracts/models/contracts.model';
import { MaintenanceIssues } from '../maintenance-issues/models/maintenance-issues.model';
import { PaymentStatus } from '../payments/enums/payment-status.enum';
import { ContractStatus } from '../contracts/enums/contract-status.enum';
import { IssueStatus } from '../maintenance-issues/enums/issue-status.enum';
import { IssuePriority } from '../maintenance-issues/enums/issue-priority.enum';
import { TenantPaymentStatus } from './enums/tenant-payment-status.enum';
import { TenantRiskStatus } from './enums/tenant-risk-status.enum';
import {
  ILandlordDashboard,
  IRentCollection,
  IOccupancyRate,
  IMaintenanceTicketSummary,
  IMaintenanceTicketItem,
  ILandlordTenant,
} from './interfaces/landlord-dashboard.interface';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    @InjectRepository(Units)
    private readonly unitsRepository: Repository<Units>,
    @InjectRepository(Payments)
    private readonly paymentsRepository: Repository<Payments>,
    @InjectRepository(Contracts)
    private readonly contractsRepository: Repository<Contracts>,
    @InjectRepository(MaintenanceIssues)
    private readonly maintenanceIssuesRepository: Repository<MaintenanceIssues>,
  ) {}

  async getLandlordDashboard(landlordId: number): Promise<ILandlordDashboard> {
    const [rentCollection, occupancyRate, maintenanceSummary, maintenanceTickets] =
      await Promise.all([
        this.getRentCollection(landlordId),
        this.getOccupancyRate(landlordId),
        this.getMaintenanceSummary(landlordId),
        this.getMaintenanceTickets(landlordId),
      ]);

    return {
      rent_collection: rentCollection,
      occupancy_rate: occupancyRate,
      maintenance_summary: maintenanceSummary,
      maintenance_tickets: maintenanceTickets,
    };
  }

  private async getRentCollection(landlordId: number): Promise<IRentCollection> {
    // Get all properties owned by landlord
    const properties = await this.propertiesRepository.find({
      where: { landlord_id: landlordId },
    });

    const propertyIds = properties.map((p) => p.property_id);

    if (propertyIds.length === 0) {
      return {
        total_collected: 0,
        total_pending: 0,
        this_month_rent_collected: 0,
        this_year_rent_collected: 0,
        percentage_collected: 0,
        percentage_pending: 0,
        currency: 'RM',
      };
    }

    // Get all units for these properties
    const units = await this.unitsRepository.find({
      where: propertyIds.map((id) => ({ property_id: id })),
    });

    const unitIds = units.map((u) => u.unit_id);

    if (unitIds.length === 0) {
      return {
        total_collected: 0,
        total_pending: 0,
        this_month_rent_collected: 0,
        this_year_rent_collected: 0,
        percentage_collected: 0,
        percentage_pending: 0,
        currency: 'RM',
      };
    }

    // Get payments through contracts for these units
    const payments = await this.paymentsRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.contract', 'contract')
      .where('contract.unit_id IN (:...unitIds)', { unitIds })
      .getMany();

    // Get current date info for filtering
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const startOfYear = new Date(currentYear, 0, 1);

    let totalCollected = 0;
    let totalPending = 0;
    let thisMonthCollected = 0;
    let thisYearCollected = 0;

    payments.forEach((payment) => {
      const amount = Number(payment.amount);
      const paymentDate = payment.payment_date ? new Date(payment.payment_date) : null;

      if (payment.status === PaymentStatus.PAID) {
        totalCollected += amount;

        // Check if paid this month
        if (paymentDate && paymentDate >= startOfMonth) {
          thisMonthCollected += amount;
        }

        // Check if paid this year
        if (paymentDate && paymentDate >= startOfYear) {
          thisYearCollected += amount;
        }
      } else if (
        payment.status === PaymentStatus.PENDING ||
        payment.status === PaymentStatus.OVERDUE
      ) {
        totalPending += amount;
      }
    });

    const total = totalCollected + totalPending;
    const percentageCollected = total > 0 ? (totalCollected / total) * 100 : 0;
    const percentagePending = total > 0 ? (totalPending / total) * 100 : 0;

    return {
      total_collected: totalCollected,
      total_pending: totalPending,
      this_month_rent_collected: thisMonthCollected,
      this_year_rent_collected: thisYearCollected,
      percentage_collected: Math.round(percentageCollected * 100) / 100,
      percentage_pending: Math.round(percentagePending * 100) / 100,
      currency: 'RM',
    };
  }

  private async getOccupancyRate(landlordId: number): Promise<IOccupancyRate> {
    // Get all properties owned by landlord
    const properties = await this.propertiesRepository.find({
      where: { landlord_id: landlordId },
    });

    const propertyIds = properties.map((p) => p.property_id);

    if (propertyIds.length === 0) {
      return {
        total_units: 0,
        occupied_units: 0,
        vacant_units: 0,
        occupancy_percentage: 0,
      };
    }

    // Get all units for these properties
    const units = await this.unitsRepository.find({
      where: propertyIds.map((id) => ({ property_id: id })),
    });

    const totalUnits = units.length;
    // Assuming 'Occupied' or 'Rented' status means occupied, 'Available' or 'Vacant' means vacant
    const occupiedUnits = units.filter(
      (u) =>
        u.status?.toLowerCase() === 'occupied' ||
        u.status?.toLowerCase() === 'rented',
    ).length;
    const vacantUnits = totalUnits - occupiedUnits;
    const occupancyPercentage =
      totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    return {
      total_units: totalUnits,
      occupied_units: occupiedUnits,
      vacant_units: vacantUnits,
      occupancy_percentage: Math.round(occupancyPercentage * 100) / 100,
    };
  }

  private async getMaintenanceSummary(
    landlordId: number,
  ): Promise<IMaintenanceTicketSummary> {
    // Get all properties owned by landlord
    const properties = await this.propertiesRepository.find({
      where: { landlord_id: landlordId },
    });

    const propertyIds = properties.map((p) => p.property_id);

    if (propertyIds.length === 0) {
      return {
        total_open: 0,
        high_priority: 0,
        medium_priority: 0,
        low_priority: 0,
        urgent_priority: 0,
      };
    }

    // Get all units for these properties
    const units = await this.unitsRepository.find({
      where: propertyIds.map((id) => ({ property_id: id })),
    });

    const unitIds = units.map((u) => u.unit_id);

    if (unitIds.length === 0) {
      return {
        total_open: 0,
        high_priority: 0,
        medium_priority: 0,
        low_priority: 0,
        urgent_priority: 0,
      };
    }

    // Get open maintenance issues for these units
    const openIssues = await this.maintenanceIssuesRepository.find({
      where: unitIds.map((id) => ({
        unit_id: id,
        status: Not(IssueStatus.COMPLETED),
      })),
    });

    const summary = {
      total_open: openIssues.length,
      high_priority: 0,
      medium_priority: 0,
      low_priority: 0,
      urgent_priority: 0,
    };

    openIssues.forEach((issue) => {
      switch (issue.priority) {
        case IssuePriority.HIGH:
          summary.high_priority++;
          break;
        case IssuePriority.MEDIUM:
          summary.medium_priority++;
          break;
        case IssuePriority.LOW:
          summary.low_priority++;
          break;
        case IssuePriority.URGENT:
          summary.urgent_priority++;
          break;
      }
    });

    return summary;
  }

  private async getMaintenanceTickets(
    landlordId: number,
  ): Promise<IMaintenanceTicketItem[]> {
    // Get all properties owned by landlord
    const properties = await this.propertiesRepository.find({
      where: { landlord_id: landlordId },
    });

    const propertyIds = properties.map((p) => p.property_id);

    if (propertyIds.length === 0) {
      return [];
    }

    // Get all units for these properties with property info
    const units = await this.unitsRepository.find({
      where: propertyIds.map((id) => ({ property_id: id })),
      relations: ['property'],
    });

    const unitIds = units.map((u) => u.unit_id);

    if (unitIds.length === 0) {
      return [];
    }

    // Get open maintenance issues for these units
    const openIssues = await this.maintenanceIssuesRepository.find({
      where: unitIds.map((id) => ({
        unit_id: id,
        status: Not(IssueStatus.COMPLETED),
      })),
      relations: ['unit', 'unit.property'],
      order: { reported_date: 'DESC' },
    });

    return openIssues.map((issue) => ({
      issue_id: issue.issue_id,
      unit_number: issue.unit?.unit_number || 'N/A',
      property_address: issue.unit?.property?.address || 'N/A',
      title: issue.title,
      priority: issue.priority,
      reported_date: issue.reported_date,
    }));
  }

  async getLandlordTenants(landlordId: number): Promise<ILandlordTenant[]> {
    // Get all properties owned by landlord
    const properties = await this.propertiesRepository.find({
      where: { landlord_id: landlordId },
    });

    const propertyIds = properties.map((p) => p.property_id);

    if (propertyIds.length === 0) {
      return [];
    }

    // Get all units for these properties
    const units = await this.unitsRepository.find({
      where: propertyIds.map((id) => ({ property_id: id })),
      relations: ['property'],
    });

    const unitIds = units.map((u) => u.unit_id);

    if (unitIds.length === 0) {
      return [];
    }

    // Get all active contracts for these units with tenant info
    const contracts = await this.contractsRepository.find({
      where: unitIds.map((id) => ({
        unit_id: id,
        status: ContractStatus.ACTIVE,
      })),
      relations: ['tenant', 'unit', 'unit.property'],
    });

    // Get all tenants with their payment history
    const tenants: ILandlordTenant[] = [];

    for (const contract of contracts) {
      if (!contract.tenant) continue;

      // Get payments for this contract
      const payments = await this.paymentsRepository.find({
        where: { contract_id: contract.contract_id },
        order: { due_date: 'DESC' },
      });

      // Calculate payment status
      const paymentStatus = this.calculatePaymentStatus(payments);

      // Calculate risk status based on payment history
      const riskStatus = this.calculateRiskStatus(payments);

      tenants.push({
        tenant_id: contract.tenant.user_id,
        tenant_name: `${contract.tenant.first_name} ${contract.tenant.last_name}`,
        email: contract.tenant.email,
        phone_number: contract.tenant.phone_number || 'N/A',
        unit_number: contract.unit?.unit_number || 'N/A',
        property_address: contract.unit?.property?.address || 'N/A',
        lease_period: {
          start_date: contract.start_date,
          end_date: contract.end_date,
        },
        status: contract.status,
        payment_status: paymentStatus,
        risk_status: riskStatus,
      });
    }

    return tenants;
  }

  private calculatePaymentStatus(payments: Payments[]): TenantPaymentStatus {
    if (payments.length === 0) {
      return TenantPaymentStatus.PENDING;
    }

    const now = new Date();
    const recentPayments = payments.slice(0, 3); // Check last 3 payments

    // Check for any overdue payments
    const hasOverdue = recentPayments.some(
      (p) => p.status === PaymentStatus.OVERDUE,
    );
    if (hasOverdue) {
      return TenantPaymentStatus.LATE;
    }

    // Check for pending payments past due date
    const hasPendingPastDue = recentPayments.some(
      (p) =>
        p.status === PaymentStatus.PENDING && new Date(p.due_date) < now,
    );
    if (hasPendingPastDue) {
      return TenantPaymentStatus.LATE;
    }

    // Check for any pending payments
    const hasPending = recentPayments.some(
      (p) => p.status === PaymentStatus.PENDING,
    );
    if (hasPending) {
      return TenantPaymentStatus.PENDING;
    }

    // All recent payments are paid on time
    return TenantPaymentStatus.ON_TIME;
  }

  private calculateRiskStatus(payments: Payments[]): TenantRiskStatus {
    if (payments.length === 0) {
      return TenantRiskStatus.LOW;
    }

    // Count late/overdue payments
    const overdueCount = payments.filter(
      (p) => p.status === PaymentStatus.OVERDUE,
    ).length;
    const totalPayments = payments.length;

    // Calculate late payment ratio
    const lateRatio = totalPayments > 0 ? overdueCount / totalPayments : 0;

    // Risk assessment based on payment history
    // This is a simple algorithm - Claude AI integration can enhance this
    if (lateRatio >= 0.5 || overdueCount >= 3) {
      return TenantRiskStatus.HIGH;
    } else if (lateRatio >= 0.2 || overdueCount >= 1) {
      return TenantRiskStatus.MEDIUM;
    }

    return TenantRiskStatus.LOW;
  }
}

