import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginDto } from '../login/dto/login.dto';
import {
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthType } from './enums/auth-type.enum';
import { AuthGuard } from './decorators/auth-guard.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponse } from './interfaces/auth-response.interface';

interface LogoutResponse {
  message: string;
  status: number;
  redirect_url: string;
}

@ApiTags('auth')
@Controller('auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  @AuthGuard(AuthType.None)
  @HttpCode(200)
  @ApiOperation({ summary: 'Login a user and get role-based redirect URL' })
  @ApiOkResponse({
    description:
      'Authenticate user with email and password, return tokens and redirect URL based on role',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role_id: 2,
          role_name: 'Landlord',
        },
        redirect_url: '/landlord/dashboard',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  public async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return await this.loginService.login(loginDto);
  }

  @Post('logout')
  @AuthGuard(AuthType.Bearer)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout a user and invalidate session' })
  @ApiOkResponse({
    description: 'User logged out successfully',
    schema: {
      example: {
        message: 'Logout successful',
        status: 200,
        redirect_url: '/login',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing token' })
  public async logout(): Promise<LogoutResponse> {
    // Note: For JWT-based authentication, the actual token invalidation
    // should be handled client-side by removing the token from storage.
    // For server-side invalidation, you would need to implement a token blacklist.
    return {
      message: 'Logout successful',
      status: HttpStatus.OK,
      redirect_url: '/login',
    };
  }

  @Post('refresh-tokens')
  @AuthGuard(AuthType.None)
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Refresh tokens and return new tokens',
  })
  @ApiUnauthorizedResponse({ description: 'Forbidden' })
  public async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponse> {
    return await this.loginService.refreshTokens(refreshTokenDto);
  }
}
