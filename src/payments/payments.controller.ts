import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
  Query,
  Patch,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentDto } from './dto/payment.dto';
import { PaymentUpdateDto } from './dto/payment-update.dto';
import { IPayment } from './interfaces/payment.interface';
import { PaymentStatus } from './enums/payment-status.enum';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';

interface ApiResponseMessage {
  message: string;
  status: number;
}

interface MarkAsPaidDto {
  payment_date: Date;
  payment_method: string;
}

@ApiTags('payments')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Find all payments' })
  @ApiResponse({ status: 200, description: 'Get all payments' })
  public async findAll(): Promise<IPayment[]> {
    return this.paymentsService.findAll();
  }

  @Get('/overdue')
  @ApiOperation({ summary: 'Find all overdue payments' })
  @ApiResponse({ status: 200, description: 'Get all overdue payments' })
  public async findOverduePayments(): Promise<IPayment[]> {
    return this.paymentsService.findOverduePayments();
  }

  @Get('/pending')
  @ApiOperation({ summary: 'Find all pending payments' })
  @ApiResponse({ status: 200, description: 'Get all pending payments' })
  public async findPendingPayments(): Promise<IPayment[]> {
    return this.paymentsService.findPendingPayments();
  }

  @Get('/:paymentId')
  @ApiOperation({ summary: 'Find a payment by id' })
  @ApiResponse({ status: 200, description: 'Get a payment by id' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  public async findOne(
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ): Promise<IPayment> {
    return this.paymentsService.findById(paymentId);
  }

  @Get('/contract/:contractId')
  @ApiOperation({ summary: 'Find all payments by contract id' })
  @ApiResponse({ status: 200, description: 'Get all payments by contract id' })
  public async findByContractId(
    @Param('contractId', ParseIntPipe) contractId: number,
  ): Promise<IPayment[]> {
    return this.paymentsService.findByContractId(contractId);
  }

  @Get('/payer/:payerId')
  @ApiOperation({ summary: 'Find all payments by payer id' })
  @ApiResponse({ status: 200, description: 'Get all payments by payer id' })
  public async findByPayerId(
    @Param('payerId', ParseIntPipe) payerId: number,
  ): Promise<IPayment[]> {
    return this.paymentsService.findByPayerId(payerId);
  }

  @Get('/search/status')
  @ApiOperation({ summary: 'Find all payments by status' })
  @ApiResponse({ status: 200, description: 'Get all payments by status' })
  @ApiQuery({ name: 'status', required: true, enum: PaymentStatus })
  public async findByStatus(
    @Query('status') status: PaymentStatus,
  ): Promise<IPayment[]> {
    return this.paymentsService.findByStatus(status);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiCreatedResponse({ description: 'Payment created successfully' })
  @ApiBadRequestResponse({ description: 'Payment not created' })
  public async create(@Body() paymentDto: PaymentDto): Promise<IPayment> {
    return this.paymentsService.create(paymentDto);
  }

  @Put('/:paymentId')
  @ApiOperation({ summary: 'Update a payment by id' })
  @ApiResponse({ status: 200, description: 'Update a payment by id' })
  @ApiBadRequestResponse({ description: 'Payment not updated' })
  public async update(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body() paymentUpdateDto: PaymentUpdateDto,
  ): Promise<ApiResponseMessage> {
    try {
      await this.paymentsService.update(paymentId, paymentUpdateDto);

      return {
        message: 'Payment updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Payment not updated!');
    }
  }

  @Patch('/:paymentId/status')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiResponse({ status: 200, description: 'Payment status updated' })
  @ApiBadRequestResponse({ description: 'Payment status not updated' })
  @ApiQuery({ name: 'status', required: true, enum: PaymentStatus })
  public async updateStatus(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Query('status') status: PaymentStatus,
  ): Promise<ApiResponseMessage> {
    try {
      await this.paymentsService.updateStatus(paymentId, status);

      return {
        message: 'Payment status updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Payment status not updated!');
    }
  }

  @Patch('/:paymentId/mark-paid')
  @ApiOperation({ summary: 'Mark payment as paid' })
  @ApiResponse({ status: 200, description: 'Payment marked as paid' })
  @ApiBadRequestResponse({ description: 'Payment not marked as paid' })
  public async markAsPaid(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body() markAsPaidDto: MarkAsPaidDto,
  ): Promise<ApiResponseMessage> {
    try {
      await this.paymentsService.markAsPaid(
        paymentId,
        markAsPaidDto.payment_date,
        markAsPaidDto.payment_method,
      );

      return {
        message: 'Payment marked as paid successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Payment not marked as paid!');
    }
  }

  @Delete('/:paymentId')
  @ApiOperation({ summary: 'Delete a payment by id' })
  @ApiResponse({ status: 200, description: 'Delete a payment by id' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  public async delete(
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ): Promise<ApiResponseMessage> {
    await this.paymentsService.delete(paymentId);

    return {
      message: 'Payment deleted successfully!',
      status: HttpStatus.OK,
    };
  }
}

