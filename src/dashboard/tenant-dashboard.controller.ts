import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Request,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { TenantDashboardDto } from './dto/tenant-dashboard.dto';
import { TenantPaymentSummaryDto } from './dto/tenant-payment-summary.dto';
import { TenantPropertyDetailsDto } from './dto/tenant-property-details.dto';
import { TenantMaintenanceTicketsDto, TicketDetailsDto } from './dto/tenant-maintenance-tickets.dto';
import {
  TenantDocumentsDto,
  UploadDocumentDto,
  UploadDocumentResponseDto,
  DeleteDocumentResponseDto,
  TenantDocumentItemDto,
} from './dto/tenant-documents.dto';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';
import { TenantGuard } from './guards/tenant.guard';

interface TenantRequest {
  tenant?: {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  user?: {
    id: number;
  };
}

@ApiTags('tenant')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('tenant')
export class TenantDashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get tenant dashboard data' })
  @ApiOkResponse({
    description: 'Returns tenant dashboard with rent status, maintenance tickets, lease info, and documents',
    type: TenantDashboardDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not a tenant' })
  async getTenantDashboard(@Request() req: TenantRequest): Promise<TenantDashboardDto> {
    const tenantId = req.tenant?.user_id || req.user?.id;
    const tenantName = req.tenant 
      ? `${req.tenant.first_name} ${req.tenant.last_name}` 
      : 'Unknown';
    const tenantEmail = req.tenant?.email || '';
    
    return this.dashboardService.getTenantDashboard(tenantId, tenantName, tenantEmail);
  }

  @Get('payment/summary')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get tenant payment summary for current month' })
  @ApiOkResponse({
    description: 'Returns payment summary with rent amount, SST, total payable (if unpaid) or payment details (if paid)',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not a tenant' })
  async getTenantPaymentSummary(@Request() req: TenantRequest): Promise<TenantPaymentSummaryDto> {
    const tenantId = req.tenant?.user_id || req.user?.id;
    return this.dashboardService.getTenantPaymentSummary(tenantId);
  }

  @Get('property/details')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get tenant property and unit details' })
  @ApiOkResponse({
    description: 'Returns property info, unit details, landlord contact info, and rental period',
    type: TenantPropertyDetailsDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not a tenant' })
  async getTenantPropertyDetails(@Request() req: TenantRequest): Promise<TenantPropertyDetailsDto> {
    const tenantId = req.tenant?.user_id || req.user?.id;
    return this.dashboardService.getTenantPropertyDetails(tenantId);
  }

  @Get('maintenance/tickets')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get all maintenance tickets for tenant' })
  @ApiOkResponse({
    description: 'Returns ticket summary and list of maintenance tickets',
    type: TenantMaintenanceTicketsDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not a tenant' })
  async getTenantMaintenanceTickets(@Request() req: TenantRequest): Promise<TenantMaintenanceTicketsDto> {
    const tenantId = req.tenant?.user_id || req.user?.id;
    return this.dashboardService.getTenantMaintenanceTickets(tenantId);
  }

  @Get('maintenance/tickets/:ticketId')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get detailed information about a specific ticket' })
  @ApiParam({
    name: 'ticketId',
    description: 'Ticket ID in format TKT-YYYY-XXX (e.g., TKT-2023-105)',
    example: 'TKT-2023-105',
  })
  @ApiOkResponse({
    description: 'Returns detailed ticket information with timeline/activity logs',
    type: TicketDetailsDto,
  })
  @ApiNotFoundResponse({ description: 'Ticket not found or access denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not a tenant' })
  async getTicketDetails(
    @Request() req: TenantRequest,
    @Param('ticketId') ticketId: string,
  ): Promise<TicketDetailsDto> {
    const tenantId = req.tenant?.user_id || req.user?.id;
    return this.dashboardService.getTicketDetails(tenantId, ticketId);
  }

  @Post('cancel-ticket/:ticketId')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Cancel a maintenance ticket' })
  @ApiParam({
    name: 'ticketId',
    description: 'Ticket ID in format TKT-YYYY-XXX (e.g., TKT-2023-105)',
    example: 'TKT-2023-105',
  })
  @ApiOkResponse({
    description: 'Ticket cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Ticket TKT-2023-105 has been cancelled successfully' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Cannot cancel ticket - only tickets with status "New" can be cancelled',
  })
  @ApiNotFoundResponse({ description: 'Ticket not found or access denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not a tenant' })
  async cancelTicket(
    @Request() req: TenantRequest,
    @Param('ticketId') ticketId: string,
  ): Promise<{ success: boolean; message: string }> {
    const tenantId = req.tenant?.user_id || req.user?.id;
    return this.dashboardService.cancelTicket(tenantId, ticketId);
  }

  // ==================== DOCUMENT MANAGEMENT ====================

  @Get('documents')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get all documents for tenant' })
  @ApiOkResponse({
    description: 'Returns list of documents with file count',
    type: TenantDocumentsDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not a tenant' })
  async getTenantDocuments(@Request() req: TenantRequest): Promise<TenantDocumentsDto> {
    const tenantId = req.tenant?.user_id || req.user?.id;
    return this.dashboardService.getTenantDocuments(tenantId);
  }

  @Post('documents/upload')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiBody({ type: UploadDocumentDto })
  @ApiOkResponse({
    description: 'Document uploaded successfully',
    type: UploadDocumentResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid document type or file' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not a tenant' })
  async uploadDocument(
    @Request() req: TenantRequest,
    @Body() uploadDto: UploadDocumentDto,
  ): Promise<UploadDocumentResponseDto> {
    const tenantId = req.tenant?.user_id || req.user?.id;
    
    // Note: In a real implementation, you would handle file upload here
    // using @UseInterceptors(FileInterceptor('file')) and upload to R2
    // For now, we'll use the provided file_name as placeholder
    const fileName = uploadDto.file_name || `document_${Date.now()}`;
    const filePath = `docs/${fileName}`;

    return this.dashboardService.uploadDocument(
      tenantId,
      uploadDto.document_type,
      fileName,
      filePath,
    );
  }

  @Get('documents/:docId')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get document details for download' })
  @ApiParam({ name: 'docId', description: 'Document ID', type: Number })
  @ApiOkResponse({
    description: 'Returns document details with download URL',
    type: TenantDocumentItemDto,
  })
  @ApiNotFoundResponse({ description: 'Document not found or access denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not a tenant' })
  async getDocumentForDownload(
    @Request() req: TenantRequest,
    @Param('docId', ParseIntPipe) docId: number,
  ): Promise<{ success: boolean; document?: TenantDocumentItemDto; message?: string }> {
    const tenantId = req.tenant?.user_id || req.user?.id;
    return this.dashboardService.getDocumentForDownload(tenantId, docId);
  }

  @Delete('documents/:docId')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({ name: 'docId', description: 'Document ID', type: Number })
  @ApiOkResponse({
    description: 'Document deleted successfully',
    type: DeleteDocumentResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Document not found or access denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not a tenant' })
  async deleteDocument(
    @Request() req: TenantRequest,
    @Param('docId', ParseIntPipe) docId: number,
  ): Promise<DeleteDocumentResponseDto> {
    const tenantId = req.tenant?.user_id || req.user?.id;
    return this.dashboardService.deleteDocument(tenantId, docId);
  }
}

