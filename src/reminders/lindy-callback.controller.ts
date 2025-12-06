import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { LindyReminderDto, LindyReminderResponseDto } from './dto/lindy-reminder.dto';
import { LindyService } from '../common/lindy/lindy.service';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';

/**
 * Controller for testing Lindy AI integration
 * No authentication required for testing
 */
@ApiTags('lindy')
@AuthGuard(AuthType.None) // Disable JWT auth for Lindy endpoints
@Controller('lindy')
export class LindyCallbackController {
  constructor(private readonly lindyService: LindyService) {}

  /**
   * Test endpoint: Send reminder data TO Lindy webhook URL
   * Use this to test the Backend → Lindy flow
   */
  @Post('send-to-lindy')
  @ApiOperation({ summary: 'Send rent reminder TO Lindy webhook (for testing)' })
  @ApiConsumes('application/json')
  @ApiBody({
    type: LindyReminderDto,
    description: 'Rent reminder data to send to Lindy',
    examples: {
      example1: {
        summary: 'Upcoming rent reminder',
        value: {
          tenant_id: 1,
          tenant_name: 'John Doe',
          tenant_email: 'john@email.com',
          unit_number: 'A-12-03',
          property_address: '123 Jalan Ampang, KL',
          amount_due: 1500.00,
          due_date: '2025-12-15',
          days_until_due: 7,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Reminder sent to Lindy successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to send to Lindy',
  })
  async sendToLindy(@Body() reminderDto: LindyReminderDto) {
    // Send TO Lindy webhook URL (LINDY_WEBHOOK_URL in .env)
    const result = await this.lindyService.sendRentReminder({
      tenant_id: reminderDto.tenant_id,
      tenant_name: reminderDto.tenant_name,
      tenant_email: reminderDto.tenant_email,
      unit_number: reminderDto.unit_number,
      property_address: reminderDto.property_address,
      amount_due: reminderDto.amount_due,
      due_date: reminderDto.due_date,
      days_until_due: reminderDto.days_until_due,
      currency: 'RM',
    });

    return {
      success: result.success,
      message: result.success 
        ? 'Reminder sent to Lindy successfully' 
        : `Failed: ${result.error}`,
      lindy_webhook_url: process.env.LINDY_WEBHOOK_URL || 'NOT SET',
      data_sent: reminderDto,
      timestamp: new Date().toISOString(),
    };
  }
}

