import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RentReminderService } from './rent-reminder.service';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';
import { LandlordGuard } from '../dashboard/guards/landlord.guard';

@ApiTags('reminders')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('reminders')
export class RentReminderController {
  constructor(private readonly rentReminderService: RentReminderService) {}

  @Get('pending')
  @UseGuards(LandlordGuard)
  @ApiOperation({ summary: 'Get all pending rent reminders' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of tenants with pending rent reminders',
  })
  async getPendingReminders() {
    const reminders = await this.rentReminderService.getPendingRentReminders();
    return {
      count: reminders.length,
      reminders,
    };
  }

  @Post('trigger')
  @UseGuards(LandlordGuard)
  @ApiOperation({ summary: 'Manually trigger all rent reminders via Lindy' })
  @ApiResponse({
    status: 200,
    description: 'Triggers rent reminders for all pending payments',
  })
  async triggerReminders() {
    return await this.rentReminderService.triggerManualReminders();
  }

  @Post('send/:paymentId')
  @UseGuards(LandlordGuard)
  @ApiOperation({ summary: 'Send reminder for a specific payment' })
  @ApiParam({ name: 'paymentId', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Sends reminder for the specified payment',
  })
  async sendSingleReminder(
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ) {
    return await this.rentReminderService.sendSingleReminder(paymentId);
  }
}

