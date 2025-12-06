import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { LandlordDashboardDto, LandlordTenantDto } from './dto/landlord-dashboard.dto';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';
import { LandlordGuard } from './guards/landlord.guard';

@ApiTags('landlord')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('landlord')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard')
  @UseGuards(LandlordGuard)
  @ApiOperation({ summary: 'Get landlord dashboard data' })
  @ApiOkResponse({
    description: 'Returns landlord dashboard with rent collection, occupancy, and maintenance data',
    type: LandlordDashboardDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not a landlord' })
  async getLandlordDashboard(
    @Request() req: { landlord?: { user_id: number }; user?: { id: number } },
  ): Promise<LandlordDashboardDto> {
    const landlordId = req.landlord?.user_id || req.user?.id;
    return this.dashboardService.getLandlordDashboard(landlordId);
  }

  @Get('tenants')
  @UseGuards(LandlordGuard)
  @ApiOperation({ summary: 'Get all tenants for landlord properties' })
  @ApiOkResponse({
    description: 'Returns list of tenants with lease period, status, payment status, and risk status',
    type: [LandlordTenantDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not a landlord' })
  async getLandlordTenants(
    @Request() req: { landlord?: { user_id: number }; user?: { id: number } },
  ): Promise<LandlordTenantDto[]> {
    const landlordId = req.landlord?.user_id || req.user?.id;
    return this.dashboardService.getLandlordTenants(landlordId);
  }
}

