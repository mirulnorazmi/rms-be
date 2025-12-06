import {
  Controller,
  Post,
  Body,
  HttpStatus,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterLandlordDto } from './dto/register-landlord.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthType } from '../login/enums/auth-type.enum';
import { AuthGuard } from '../login/decorators/auth-guard.decorator';

interface RegisterResponse {
  message: string;
  status: number;
  user?: {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
    role_id: number;
  };
}

@ApiTags('auth')
@AuthGuard(AuthType.None)
@Controller('auth/register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user (generic)' })
  @ApiCreatedResponse({
    description: 'Register a new user and send a confirmation email to the user',
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  public async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<RegisterResponse> {
    try {
      await this.registerService.register(registerUserDto);

      return {
        message: 'User registration successfully!',
        status: HttpStatus.CREATED,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: User not registration!');
    }
  }

  @Post('landlord')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new landlord (role_id = 2)' })
  @ApiCreatedResponse({
    description: 'Register a new landlord account',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Landlord registration successfully!' },
        status: { type: 'number', example: 201 },
        user: {
          type: 'object',
          properties: {
            user_id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'landlord@email.com' },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
            role_id: { type: 'number', example: 2 },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Bad request - Email already exists or invalid data' })
  public async registerLandlord(
    @Body() registerLandlordDto: RegisterLandlordDto,
  ): Promise<RegisterResponse> {
    try {
      const user = await this.registerService.registerLandlord(registerLandlordDto);

      return {
        message: 'Landlord registration successfully!',
        status: HttpStatus.CREATED,
        user: {
          user_id: user.user_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role_id: user.role_id,
        },
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Landlord registration failed!');
    }
  }

  @Post('tenant')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new tenant (role_id = 3)' })
  @ApiCreatedResponse({
    description: 'Register a new tenant account',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Tenant registration successfully!' },
        status: { type: 'number', example: 201 },
        user: {
          type: 'object',
          properties: {
            user_id: { type: 'number', example: 2 },
            email: { type: 'string', example: 'tenant@email.com' },
            first_name: { type: 'string', example: 'Jane' },
            last_name: { type: 'string', example: 'Smith' },
            role_id: { type: 'number', example: 3 },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Bad request - Email already exists or invalid data' })
  public async registerTenant(
    @Body() registerTenantDto: RegisterTenantDto,
  ): Promise<RegisterResponse> {
    try {
      const user = await this.registerService.registerTenant(registerTenantDto);

      return {
        message: 'Tenant registration successfully!',
        status: HttpStatus.CREATED,
        user: {
          user_id: user.user_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role_id: user.role_id,
        },
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Tenant registration failed!');
    }
  }
}
