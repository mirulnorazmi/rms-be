import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Properties } from '../properties/models/properties.model';
import { Units } from '../units/models/units.model';
import { Payments } from '../payments/models/payments.model';
import { Contracts } from '../contracts/models/contracts.model';
import { MaintenanceIssues } from '../maintenance-issues/models/maintenance-issues.model';
import { TicketActivityLog } from '../maintenance-issues/models/ticket-activity-log.model';
import { Documents } from '../documents/models/documents.model';
import { UnitDetails } from '../unit-details/models/unit-details.model';
import { PaymentStatus } from '../payments/enums/payment-status.enum';
import { ContractStatus } from '../contracts/enums/contract-status.enum';
import { IssueStatus } from '../maintenance-issues/enums/issue-status.enum';
import { IssuePriority } from '../maintenance-issues/enums/issue-priority.enum';
import { TenantPaymentStatus } from './enums/tenant-payment-status.enum';
import { TenantRiskStatus } from './enums/tenant-risk-status.enum';
import { RentStatus } from './enums/rent-status.enum';
import { AiService } from '../common/ai/ai.service';
import {
  ILandlordDashboard,
  IRentCollection,
  IOccupancyRate,
  IMaintenanceTicketSummary,
  IMaintenanceTicketItem,
  ILandlordTenant,
} from './interfaces/landlord-dashboard.interface';
import {
  ITenantDashboard,
  IRentOverview,
  IMaintenanceTicketCount,
  IMaintenanceTicketTableItem,
  ILeaseInfo,
  IMessage,
  IRecentDocument,
} from './interfaces/tenant-dashboard.interface';
import {
  ITenantPaymentSummary,
  IUnpaidPaymentSummary,
  IPaidPaymentSummary,
} from './interfaces/tenant-payment-summary.interface';
import { ITenantPropertyDetails } from './interfaces/tenant-property-details.interface';
import {
  ITenantMaintenanceTickets,
  ITicketDetails,
} from './interfaces/tenant-maintenance-tickets.interface';
import {
  ITenantDocuments,
  ITenantDocumentItem,
  IUploadDocumentResponse,
  IDeleteDocumentResponse,
} from './interfaces/tenant-documents.interface';
import { DocType } from '../documents/enums/doc-type.enum';

@Injectable()
export class DashboardService {
  private readonly r2BaseUrl: string;

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
    @InjectRepository(Documents)
    private readonly documentsRepository: Repository<Documents>,
    @InjectRepository(UnitDetails)
    private readonly unitDetailsRepository: Repository<UnitDetails>,
    @InjectRepository(TicketActivityLog)
    private readonly ticketActivityLogRepository: Repository<TicketActivityLog>,
    private readonly aiService: AiService,
  ) {
    // Cloudflare R2 public URL from environment
    this.r2BaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';
  }

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

      // Calculate risk status using Claude AI
      const riskStatus = await this.calculateRiskStatusWithAI(payments);

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

  private async calculateRiskStatusWithAI(
    payments: Payments[],
  ): Promise<TenantRiskStatus> {
    // Build payment history for AI analysis
    const now = new Date();
    
    const paidOnTime = payments.filter(
      (p) => p.status === PaymentStatus.PAID && 
             p.payment_date && 
             new Date(p.payment_date) <= new Date(p.due_date),
    ).length;

    const paidLate = payments.filter(
      (p) => p.status === PaymentStatus.PAID && 
             p.payment_date && 
             new Date(p.payment_date) > new Date(p.due_date),
    ).length;

    const overdue = payments.filter(
      (p) => p.status === PaymentStatus.OVERDUE,
    ).length;

    const pending = payments.filter(
      (p) => p.status === PaymentStatus.PENDING,
    ).length;

    // Calculate average days late for late payments
    let totalDaysLate = 0;
    let latePaymentsCount = 0;
    payments.forEach((p) => {
      if (p.status === PaymentStatus.PAID && p.payment_date) {
        const paymentDate = new Date(p.payment_date);
        const dueDate = new Date(p.due_date);
        if (paymentDate > dueDate) {
          const daysLate = Math.ceil(
            (paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
          );
          totalDaysLate += daysLate;
          latePaymentsCount++;
        }
      }
    });

    const totalAmountDue = payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const totalAmountPaid = payments
      .filter((p) => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const paymentHistory = {
      total_payments: payments.length,
      paid_on_time: paidOnTime,
      paid_late: paidLate,
      overdue,
      pending,
      average_days_late: latePaymentsCount > 0 
        ? Math.round(totalDaysLate / latePaymentsCount) 
        : 0,
      total_amount_due: totalAmountDue,
      total_amount_paid: totalAmountPaid,
    };

    // Use Claude AI for risk assessment
    return this.aiService.calculateTenantRiskStatus(paymentHistory);
  }

  // ==================== TENANT DASHBOARD ====================

  async getTenantDashboard(tenantId: number, tenantName: string, tenantEmail: string): Promise<ITenantDashboard> {
    // Get active contract for this tenant
    const contract = await this.contractsRepository.findOne({
      where: { 
        tenant_id: tenantId,
        status: ContractStatus.ACTIVE,
      },
      relations: ['unit', 'unit.property'],
    });

    // Get rent overview, maintenance info, messages, and documents in parallel
    const [rentOverview, maintenanceInfo, leaseInfo, messages, recentDocuments] = await Promise.all([
      this.getTenantRentOverview(tenantId, contract),
      this.getTenantMaintenanceInfo(tenantId),
      this.getTenantLeaseInfo(contract),
      this.getTenantMessages(tenantId, contract),
      this.getTenantRecentDocuments(tenantId, contract),
    ]);

    // Determine rent status
    const rentStatus = rentOverview.amount_due > 0 ? RentStatus.UNPAID : RentStatus.PAID;

    return {
      tenant_id: tenantId,
      tenant_name: tenantName,
      email: tenantEmail,
      rent_status: rentStatus,
      rent_overview: rentOverview,
      maintenance_ticket_count: maintenanceInfo.count,
      maintenance_tickets: maintenanceInfo.tickets,
      lease_info: leaseInfo,
      messages,
      recent_documents: recentDocuments,
    };
  }

  private async getTenantRentOverview(
    tenantId: number,
    contract: Contracts | null,
  ): Promise<IRentOverview> {
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (!contract) {
      return {
        current_month: currentMonth,
        amount_due: 0,
        amount_paid: 0,
        currency: 'RM',
      };
    }

    // Get payments for current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const payments = await this.paymentsRepository
      .createQueryBuilder('payment')
      .where('payment.contract_id = :contractId', { contract_id: contract.contract_id })
      .andWhere('payment.due_date >= :startOfMonth', { startOfMonth })
      .andWhere('payment.due_date <= :endOfMonth', { endOfMonth })
      .getMany();

    let amountDue = 0;
    let amountPaid = 0;

    payments.forEach((payment) => {
      const amount = Number(payment.amount);
      if (payment.status === PaymentStatus.PAID) {
        amountPaid += amount;
      } else {
        amountDue += amount;
      }
    });

    return {
      current_month: currentMonth,
      amount_due: amountDue,
      amount_paid: amountPaid,
      currency: 'RM',
    };
  }

  private async getTenantMaintenanceInfo(tenantId: number): Promise<{
    count: IMaintenanceTicketCount;
    tickets: IMaintenanceTicketTableItem[];
  }> {
    // Get all maintenance issues reported by this tenant
    const issues = await this.maintenanceIssuesRepository.find({
      where: { reported_by_id: tenantId },
      order: { reported_date: 'DESC' },
    });

    // Count by status
    const openTickets = issues.filter(
      (i) => i.status === IssueStatus.NEW,
    ).length;
    const inProgressTickets = issues.filter(
      (i) => i.status === IssueStatus.IN_PROGRESS,
    ).length;
    const closedTickets = issues.filter(
      (i) => i.status === IssueStatus.COMPLETED,
    ).length;

    // Map to table items
    const tickets: IMaintenanceTicketTableItem[] = issues.map((issue) => ({
      ticket_id: issue.issue_id,
      title: issue.title,
      date: issue.reported_date,
      status: issue.status,
      // For now, we'll check if completion_date is set as a simple "response" indicator
      // A proper implementation would have a separate responses/comments table
      has_new_response: issue.completion_date !== null && issue.status !== IssueStatus.COMPLETED,
    }));

    return {
      count: {
        open_tickets: openTickets,
        in_progress_tickets: inProgressTickets,
        closed_tickets: closedTickets,
      },
      tickets,
    };
  }

  private async getTenantLeaseInfo(contract: Contracts | null): Promise<ILeaseInfo | null> {
    if (!contract) {
      return null;
    }

    const startDate = new Date(contract.start_date);
    const renewalDate = new Date(startDate);
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);

    return {
      property_address: contract.unit?.property?.address || 'N/A',
      unit_number: contract.unit?.unit_number || 'N/A',
      lease_start_date: contract.start_date,
      lease_end_date: contract.end_date,
      renewal_date: renewalDate,
    };
  }

  private async getTenantMessages(
    tenantId: number,
    contract: Contracts | null,
  ): Promise<IMessage[]> {
    const messages: IMessage[] = [];
    const now = new Date();

    if (contract) {
      // Get current month payments to check rent status
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const payments = await this.paymentsRepository
        .createQueryBuilder('payment')
        .where('payment.contract_id = :contractId', { contractId: contract.contract_id })
        .andWhere('payment.due_date >= :startOfMonth', { startOfMonth })
        .andWhere('payment.due_date <= :endOfMonth', { endOfMonth })
        .getMany();

      // Check for unpaid rent
      const unpaidPayments = payments.filter(
        (p) => p.status === PaymentStatus.PENDING || p.status === PaymentStatus.OVERDUE,
      );
      const paidPayments = payments.filter((p) => p.status === PaymentStatus.PAID);

      if (unpaidPayments.length > 0) {
        const totalDue = unpaidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const dueDate = unpaidPayments[0].due_date;
        messages.push({
          type: 'rent_due',
          message: `Your rent of RM ${totalDue.toFixed(2)} is due on ${new Date(dueDate).toLocaleDateString()}. Please make payment to avoid late fees.`,
          date: new Date(dueDate),
        });
      }

      if (paidPayments.length > 0) {
        const totalPaid = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const paymentDate = paidPayments[0].payment_date;
        messages.push({
          type: 'rent_paid',
          message: `Thank you! Your rent payment of RM ${totalPaid.toFixed(2)} has been received.`,
          date: paymentDate ? new Date(paymentDate) : now,
        });
      }
    }

    // Get maintenance ticket messages
    const openIssues = await this.maintenanceIssuesRepository.find({
      where: { 
        reported_by_id: tenantId,
        status: Not(IssueStatus.COMPLETED),
      },
      order: { reported_date: 'DESC' },
    });

    openIssues.forEach((issue) => {
      // Check if there's a response (using completion_date or status change as indicator)
      if (issue.status === IssueStatus.IN_PROGRESS) {
        messages.push({
          type: 'ticket_response',
          message: `New response on ticket #${issue.issue_id}: "${issue.title}". Status updated to In Progress.`,
          date: issue.reported_date,
          ticket_id: issue.issue_id,
        });
      } else if (issue.status === IssueStatus.NEW) {
        messages.push({
          type: 'ticket_no_response',
          message: `No response yet on ticket #${issue.issue_id}: "${issue.title}" submitted on ${new Date(issue.reported_date).toLocaleDateString()}.`,
          date: issue.reported_date,
          ticket_id: issue.issue_id,
        });
      }
    });

    return messages;
  }

  private async getTenantRecentDocuments(
    tenantId: number,
    contract: Contracts | null,
  ): Promise<IRecentDocument[]> {
    if (!contract) {
      return [];
    }

    // Get documents related to the tenant's contract
    const documents = await this.documentsRepository.find({
      where: { contract_id: contract.contract_id },
      order: { uploaded_at: 'DESC' },
      take: 10, // Limit to 10 recent documents
    });

    return documents.map((doc) => {
      // Extract filename from file_path
      const pathParts = doc.file_path.split('/');
      const fileName = pathParts[pathParts.length - 1] || doc.file_path;

      // Construct full R2 URL
      const fileUrl = this.r2BaseUrl 
        ? `${this.r2BaseUrl}/${doc.file_path}`
        : doc.file_path;

      return {
        doc_id: doc.doc_id,
        doc_type: doc.doc_type,
        file_name: fileName,
        file_path: doc.file_path,
        file_url: fileUrl,
        uploaded_at: doc.uploaded_at,
      };
    });
  }

  // ==================== TENANT PAYMENT SUMMARY ====================

  async getTenantPaymentSummary(tenantId: number): Promise<ITenantPaymentSummary> {
    // Get active contract for this tenant
    const contract = await this.contractsRepository.findOne({
      where: {
        tenant_id: tenantId,
        status: ContractStatus.ACTIVE,
      },
      relations: ['unit'],
    });

    if (!contract) {
      // No active contract - return unpaid with zero amounts
      return {
        status: 'Unpaid',
        base_rent: 0,
        sst_info: {
          rate_percentage: 0,
          amount: 0,
          description: 'No active contract found',
        },
        total_payable: 0,
        due_date: new Date(),
        days_until_due: 0,
        is_overdue: false,
        currency: 'RM',
      } as IUnpaidPaymentSummary;
    }

    // Get current month payment
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentMonthPayment = await this.paymentsRepository
      .createQueryBuilder('payment')
      .where('payment.contract_id = :contractId', { contractId: contract.contract_id })
      .andWhere('payment.due_date >= :startOfMonth', { startOfMonth })
      .andWhere('payment.due_date <= :endOfMonth', { endOfMonth })
      .orderBy('payment.due_date', 'DESC')
      .getOne();

    if (!currentMonthPayment) {
      // No payment record for this month - check unit's monthly rent
      const baseRent = Number(contract.unit?.monthly_rent || 0);
      const sstInfo = await this.aiService.calculateMalaysianSST(baseRent);

      // Default due date is 1st of current month
      const dueDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        status: 'Unpaid',
        base_rent: baseRent,
        sst_info: {
          rate_percentage: sstInfo.rate_percentage,
          amount: sstInfo.sst_amount,
          description: sstInfo.description,
        },
        total_payable: baseRent + sstInfo.sst_amount,
        due_date: dueDate,
        days_until_due: daysUntilDue,
        is_overdue: daysUntilDue < 0,
        currency: 'RM',
      } as IUnpaidPaymentSummary;
    }

    // Check if payment is paid or unpaid
    if (currentMonthPayment.status === PaymentStatus.PAID) {
      return {
        status: 'Paid',
        amount_paid: Number(currentMonthPayment.amount),
        payment_date: currentMonthPayment.payment_date || now,
        payment_method: currentMonthPayment.payment_method || 'N/A',
        currency: 'RM',
      } as IPaidPaymentSummary;
    }

    // Payment exists but is unpaid (Pending or Overdue)
    const baseRent = Number(currentMonthPayment.amount);
    const sstInfo = await this.aiService.calculateMalaysianSST(baseRent);
    const dueDate = new Date(currentMonthPayment.due_date);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      status: 'Unpaid',
      base_rent: baseRent,
      sst_info: {
        rate_percentage: sstInfo.rate_percentage,
        amount: sstInfo.sst_amount,
        description: sstInfo.description,
      },
      total_payable: baseRent + sstInfo.sst_amount,
      due_date: dueDate,
      days_until_due: daysUntilDue,
      is_overdue: daysUntilDue < 0,
      currency: 'RM',
    } as IUnpaidPaymentSummary;
  }

  // ==================== TENANT PROPERTY DETAILS ====================

  async getTenantPropertyDetails(tenantId: number): Promise<ITenantPropertyDetails> {
    // Get active contract for this tenant with all relations
    const contract = await this.contractsRepository.findOne({
      where: {
        tenant_id: tenantId,
        status: ContractStatus.ACTIVE,
      },
      relations: ['unit', 'unit.property', 'unit.property.landlord'],
    });

    if (!contract) {
      throw new Error('No active contract found for this tenant');
    }

    const unit = contract.unit;
    const property = unit?.property;
    const landlord = property?.landlord;

    if (!unit || !property || !landlord) {
      throw new Error('Incomplete property/unit/landlord data');
    }

    // Get unit details for this unit
    const unitDetails = await this.unitDetailsRepository.find({
      where: { unit_id: unit.unit_id },
    });

    // Calculate renewal due by (end_date + 1 day)
    const endDate = new Date(contract.end_date);
    const renewalDueBy = new Date(endDate);
    renewalDueBy.setDate(renewalDueBy.getDate() + 1);

    return {
      property: {
        property_id: property.property_id,
        property_name: property.address, // Using address as property name
        address: property.address,
        city: property.city,
        zip_code: property.zip_code,
        main_image_path: property.main_image_path || '',
      },
      unit: {
        unit_id: unit.unit_id,
        unit_number: unit.unit_number,
        monthly_rent: Number(unit.monthly_rent),
        status: unit.status,
        main_image_path: unit.main_image_path || '',
        details: unitDetails.map((detail) => ({
          unit_detail_id: detail.unit_detail_id,
          type: detail.type,
          size: detail.size,
          monthly_rent: detail.monthly_rent,
          deposit: detail.deposit,
          facilities: detail.facilities,
        })),
      },
      landlord: {
        landlord_id: landlord.user_id,
        landlord_name: `${landlord.first_name} ${landlord.last_name}`,
        landlord_email: landlord.email,
        landlord_phone_number: landlord.phone_number || 'N/A',
      },
      rental_period: {
        start_date: contract.start_date,
        end_date: contract.end_date,
        renewal_due_by: renewalDueBy,
      },
    };
  }

  // ==================== TENANT MAINTENANCE TICKETS ====================

  /**
   * Generate formatted ticket ID from issue_id
   * Format: TKT-YYYY-XXX where YYYY is year and XXX is padded issue_id
   */
  private formatTicketId(issueId: number, reportedDate: Date): string {
    const year = new Date(reportedDate).getFullYear();
    const paddedId = issueId.toString().padStart(3, '0');
    return `TKT-${year}-${paddedId}`;
  }

  /**
   * Parse ticket ID to get the issue_id
   * Input: TKT-2023-105 -> Output: 105
   */
  private parseTicketId(ticketId: string): number | null {
    const match = ticketId.match(/^TKT-\d{4}-(\d+)$/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  /**
   * Get all maintenance tickets for a tenant
   */
  async getTenantMaintenanceTickets(tenantId: number): Promise<ITenantMaintenanceTickets> {
    // Get active contract for this tenant
    const contract = await this.contractsRepository.findOne({
      where: {
        tenant_id: tenantId,
        status: ContractStatus.ACTIVE,
      },
    });

    if (!contract) {
      return {
        summary: {
          no_open_tickets: 0,
          no_inprogress_tickets: 0,
          no_resolved_tickets: 0,
        },
        tickets: [],
      };
    }

    // Get all maintenance issues for this tenant's unit
    const issues = await this.maintenanceIssuesRepository.find({
      where: { unit_id: contract.unit_id },
      relations: ['unit', 'unit.property'],
      order: { reported_date: 'DESC' },
    });

    // Calculate summary
    const summary = {
      no_open_tickets: issues.filter((i) => i.status === IssueStatus.NEW).length,
      no_inprogress_tickets: issues.filter((i) => i.status === IssueStatus.IN_PROGRESS).length,
      no_resolved_tickets: issues.filter((i) => i.status === IssueStatus.COMPLETED).length,
    };

    // Map to ticket table items
    const tickets = issues.map((issue) => ({
      ticket_id: this.formatTicketId(issue.issue_id, issue.reported_date),
      issue_id: issue.issue_id,
      ticket_title: issue.title,
      category: issue.category || 'Other',
      status: issue.status,
      priority: issue.priority,
      created_date: issue.reported_date,
    }));

    return {
      summary,
      tickets,
    };
  }

  /**
   * Get detailed information about a specific ticket
   */
  async getTicketDetails(tenantId: number, ticketId: string): Promise<ITicketDetails> {
    // Parse ticket ID to get issue_id
    const issueId = this.parseTicketId(ticketId);
    
    if (!issueId) {
      throw new Error(`Invalid ticket ID format: ${ticketId}`);
    }

    // Get active contract for this tenant
    const contract = await this.contractsRepository.findOne({
      where: {
        tenant_id: tenantId,
        status: ContractStatus.ACTIVE,
      },
    });

    if (!contract) {
      throw new Error('No active contract found for this tenant');
    }

    // Get the maintenance issue
    const issue = await this.maintenanceIssuesRepository.findOne({
      where: {
        issue_id: issueId,
        unit_id: contract.unit_id, // Ensure tenant can only view their own tickets
      },
      relations: ['unit', 'unit.property', 'reported_by'],
    });

    if (!issue) {
      throw new Error(`Ticket ${ticketId} not found or access denied`);
    }

    // Get activity logs for this ticket
    const activityLogs = await this.ticketActivityLogRepository.find({
      where: { issue_id: issueId },
      relations: ['performed_by'],
      order: { created_at: 'ASC' },
    });

    // If no activity logs exist, create a default timeline based on status
    let timeline = activityLogs.map((log) => ({
      activity_id: log.activity_id,
      activity_type: log.activity_type,
      description: log.description,
      performed_by: log.performed_by
        ? `${log.performed_by.first_name} ${log.performed_by.last_name}`
        : 'System',
      created_at: log.created_at,
    }));

    // If no activity logs, create default timeline entries
    if (timeline.length === 0) {
      timeline = this.generateDefaultTimeline(issue);
    }

    return {
      ticket_id: this.formatTicketId(issue.issue_id, issue.reported_date),
      issue_id: issue.issue_id,
      ticket_title: issue.title,
      description: issue.description,
      category: issue.category || 'Other',
      status: issue.status,
      priority: issue.priority,
      created_date: issue.reported_date,
      completion_date: issue.completion_date || null,
      unit_number: issue.unit?.unit_number || 'N/A',
      property_address: issue.unit?.property?.address || 'N/A',
      image_path: issue.image_path || null,
      timeline,
    };
  }

  /**
   * Generate default timeline based on issue status
   */
  private generateDefaultTimeline(issue: MaintenanceIssues) {
    const timeline = [];
    const reportedBy = issue.reported_by
      ? `${issue.reported_by.first_name} ${issue.reported_by.last_name}`
      : 'Tenant';

    // Ticket submitted
    timeline.push({
      activity_id: 0,
      activity_type: 'submitted',
      description: `Maintenance ticket submitted by ${reportedBy}`,
      performed_by: reportedBy,
      created_at: issue.reported_date,
    });

    // If in progress
    if (issue.status === IssueStatus.IN_PROGRESS || issue.status === IssueStatus.COMPLETED) {
      timeline.push({
        activity_id: 0,
        activity_type: 'in_progress',
        description: 'Ticket is being processed by the maintenance team',
        performed_by: 'Maintenance Team',
        created_at: issue.reported_date, // Approximate date
      });
    }

    // If completed
    if (issue.status === IssueStatus.COMPLETED) {
      timeline.push({
        activity_id: 0,
        activity_type: 'resolved',
        description: 'Maintenance issue has been resolved',
        performed_by: 'Maintenance Team',
        created_at: issue.completion_date || issue.reported_date,
      });
    }

    return timeline;
  }

  // ==================== CANCEL TICKET ====================

  /**
   * Cancel a maintenance ticket
   * Only tickets with status "New" (submitted) can be cancelled
   */
  async cancelTicket(
    tenantId: number,
    ticketId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Parse ticket ID to get issue_id
    const issueId = this.parseTicketId(ticketId);

    if (!issueId) {
      return { success: false, message: `Invalid ticket ID format: ${ticketId}` };
    }

    // Get active contract for this tenant
    const contract = await this.contractsRepository.findOne({
      where: {
        tenant_id: tenantId,
        status: ContractStatus.ACTIVE,
      },
    });

    if (!contract) {
      return { success: false, message: 'No active contract found for this tenant' };
    }

    // Get the maintenance issue
    const issue = await this.maintenanceIssuesRepository.findOne({
      where: {
        issue_id: issueId,
        unit_id: contract.unit_id, // Ensure tenant can only cancel their own tickets
      },
    });

    if (!issue) {
      return { success: false, message: `Ticket ${ticketId} not found or access denied` };
    }

    // Check if ticket is in "New" status (submitted)
    if (issue.status !== IssueStatus.NEW) {
      return {
        success: false,
        message: `Cannot cancel ticket. Only tickets with status "New" can be cancelled. Current status: ${issue.status}`,
      };
    }

    // Update status to CANCELLED
    issue.status = IssueStatus.CANCELLED;
    await this.maintenanceIssuesRepository.save(issue);

    // Log the cancellation activity
    const activityLog = this.ticketActivityLogRepository.create({
      issue_id: issueId,
      activity_type: 'cancelled',
      description: 'Ticket has been cancelled by tenant',
      performed_by_id: tenantId,
    });
    await this.ticketActivityLogRepository.save(activityLog);

    return {
      success: true,
      message: `Ticket ${ticketId} has been cancelled successfully`,
    };
  }

  // ==================== TENANT DOCUMENTS ====================

  /**
   * Get all documents for a tenant
   */
  async getTenantDocuments(tenantId: number): Promise<ITenantDocuments> {
    // Get active contract for this tenant
    const contract = await this.contractsRepository.findOne({
      where: {
        tenant_id: tenantId,
        status: ContractStatus.ACTIVE,
      },
    });

    if (!contract) {
      return {
        no_of_files_stored: 0,
        documents: [],
      };
    }

    // Get all documents for this contract
    const documents = await this.documentsRepository.find({
      where: { contract_id: contract.contract_id },
      order: { uploaded_at: 'DESC' },
    });

    const documentItems: ITenantDocumentItem[] = documents.map((doc) => ({
      doc_id: doc.doc_id,
      document_name: doc.file_name || doc.file_path.split('/').pop() || 'document',
      category: doc.doc_type,
      date_added: doc.uploaded_at,
      file_path: doc.file_path,
      file_url: `${this.r2BaseUrl}/${doc.file_path}`,
    }));

    return {
      no_of_files_stored: documents.length,
      documents: documentItems,
    };
  }

  /**
   * Upload a new document for tenant
   */
  async uploadDocument(
    tenantId: number,
    documentType: DocType,
    fileName: string,
    filePath: string,
  ): Promise<IUploadDocumentResponse> {
    // Get active contract for this tenant
    const contract = await this.contractsRepository.findOne({
      where: {
        tenant_id: tenantId,
        status: ContractStatus.ACTIVE,
      },
    });

    if (!contract) {
      return {
        success: false,
        message: 'No active contract found for this tenant',
      };
    }

    try {
      // Create new document record
      const document = this.documentsRepository.create({
        contract_id: contract.contract_id,
        uploaded_by_id: tenantId,
        doc_type: documentType,
        file_name: fileName,
        file_path: filePath,
      });

      const savedDoc = await this.documentsRepository.save(document);

      return {
        success: true,
        message: 'Document uploaded successfully',
        document: {
          doc_id: savedDoc.doc_id,
          document_name: savedDoc.file_name,
          category: savedDoc.doc_type,
          date_added: savedDoc.uploaded_at,
          file_path: savedDoc.file_path,
          file_url: `${this.r2BaseUrl}/${savedDoc.file_path}`,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to upload document: ${errorMessage}`,
      };
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(
    tenantId: number,
    docId: number,
  ): Promise<IDeleteDocumentResponse> {
    // Get active contract for this tenant
    const contract = await this.contractsRepository.findOne({
      where: {
        tenant_id: tenantId,
        status: ContractStatus.ACTIVE,
      },
    });

    if (!contract) {
      return {
        success: false,
        message: 'No active contract found for this tenant',
      };
    }

    // Find the document
    const document = await this.documentsRepository.findOne({
      where: {
        doc_id: docId,
        contract_id: contract.contract_id, // Ensure tenant can only delete their own documents
      },
    });

    if (!document) {
      return {
        success: false,
        message: `Document #${docId} not found or access denied`,
      };
    }

    try {
      // Delete from database
      await this.documentsRepository.delete({ doc_id: docId });

      // Note: You may also want to delete the file from Cloudflare R2 storage here
      // This would require implementing R2 SDK delete functionality

      return {
        success: true,
        message: `Document "${document.file_name}" deleted successfully`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to delete document: ${errorMessage}`,
      };
    }
  }

  /**
   * Get a single document for download
   */
  async getDocumentForDownload(
    tenantId: number,
    docId: number,
  ): Promise<{ success: boolean; document?: ITenantDocumentItem; message?: string }> {
    // Get active contract for this tenant
    const contract = await this.contractsRepository.findOne({
      where: {
        tenant_id: tenantId,
        status: ContractStatus.ACTIVE,
      },
    });

    if (!contract) {
      return {
        success: false,
        message: 'No active contract found for this tenant',
      };
    }

    // Find the document
    const document = await this.documentsRepository.findOne({
      where: {
        doc_id: docId,
        contract_id: contract.contract_id,
      },
    });

    if (!document) {
      return {
        success: false,
        message: `Document #${docId} not found or access denied`,
      };
    }

    return {
      success: true,
      document: {
        doc_id: document.doc_id,
        document_name: document.file_name || document.file_path.split('/').pop() || 'document',
        category: document.doc_type,
        date_added: document.uploaded_at,
        file_path: document.file_path,
        file_url: `${this.r2BaseUrl}/${document.file_path}`,
      },
    };
  }
}

