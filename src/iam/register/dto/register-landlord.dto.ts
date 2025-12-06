import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RegisterLandlordDto {
  @ApiProperty({ description: 'Email address', example: 'landlord@email.com' })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly first_name: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly last_name: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '0123456789' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  readonly phone_number?: string;

  @ApiProperty({ description: 'Password (plain text)', example: 'mypassword123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly password_clear: string;
}

