import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class LindyReminderDto {
  @ApiProperty({ description: 'Tenant ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  tenant_id: number;

  @ApiProperty({ description: 'Tenant full name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  tenant_name: string;

  @ApiProperty({ description: 'Tenant email address', example: 'john@email.com' })
  @IsString()
  @IsNotEmpty()
  tenant_email: string;

  @ApiProperty({ description: 'Unit number', example: 'A-12-03' })
  @IsString()
  @IsNotEmpty()
  unit_number: string;

  @ApiProperty({ description: 'Property address', example: '123 Jalan Ampang, KL' })
  @IsString()
  @IsNotEmpty()
  property_address: string;

  @ApiProperty({ description: 'Amount due in RM', example: 1500.00 })
  @IsNumber()
  @IsNotEmpty()
  amount_due: number;

  @ApiProperty({ description: 'Due date (YYYY-MM-DD)', example: '2025-12-15' })
  @IsString()
  @IsNotEmpty()
  due_date: string;

  @ApiProperty({ description: 'Days until due (negative if overdue)', example: 7 })
  @IsInt()
  @IsNotEmpty()
  days_until_due: number;
}

export class LindyReminderResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Reminder processed successfully' })
  message: string;

  @ApiProperty({ type: LindyReminderDto })
  data: LindyReminderDto;

  @ApiProperty({ example: '2025-12-06T10:30:00.000Z' })
  timestamp: string;
}

