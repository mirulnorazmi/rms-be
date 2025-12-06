import { Controller, Get,Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { RentReminderService } from './rent-reminder.service';
import { LindyApiKeyGuard } from '../common/lindy/lindy-api-key.guard';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';

/**
 * Controller for Lindy AI to fetch data from the backend
 * Uses API Key authentication instead of JWT Bearer token
 */
@ApiTags('lindy-callback')
@AuthGuard(AuthType.None) // Disable JWT auth for Lindy endpoints
@Controller('lindy')
export class LindyCallbackController {
  constructor(private readonly rentReminderService: RentReminderService) {}

  @Post('pending-reminders')
  @UseGuards(LindyApiKeyGuard)
  @ApiOperation({ summary: 'Get pending rent reminders for Lindy to process' })
  @ApiHeader({
    name: 'x-lindy-api-key',
    description: 'Lindy API Key for authentication',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of tenants with pending rent payments',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing Lindy API key',
  })
  async getPendingReminders() {
    const reminders = await this.rentReminderService.getPendingRentReminders();
    return {
      count: reminders.length,
      reminders,
      timestamp: new Date().toISOString(),
    };
  }
}

