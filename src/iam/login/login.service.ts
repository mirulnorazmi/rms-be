import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { AccountsUsers } from '../../users/interfaces/accounts-users.interface';
import { LoginDto } from './dto/login.dto';
import { HashingService } from '../../common/hashing/hashing.service';
import { JWTPayload } from './interfaces/jwt-payload.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Users } from '../../users/models/users.model';
import { jwtConfig } from './config/jwt.config';
import { AuthResponse } from './interfaces/auth-response.interface';

@Injectable()
export class LoginService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly hashingService: HashingService,
  ) {}

  public async findUserByEmail(loginDto: LoginDto): Promise<Users> {
    return await this.usersService.findByEmail(loginDto.email);
  }

  public async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      const user = await this.findUserByEmail(loginDto);
      if (!user) {
        throw new UnauthorizedException('User does not exists');
      }

      const passwordIsValid = await this.hashingService.compare(
        loginDto.password_clear,
        user.password_hash,
      );

      if (!passwordIsValid) {
        throw new UnauthorizedException(
          'Authentication failed. Wrong password',
        );
      }

      return await this.generateTokens(user);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async generateTokens(user: Users): Promise<AuthResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<JWTPayload>>(
        user.user_id,
        jwtConfig.accessTokenTtl ?? 3600,
        { email: user.email, role_id: user.role_id },
      ),
      this.signToken(user.user_id, jwtConfig.refreshTokenTtl ?? 86400),
    ]);

    // Determine redirect URL based on role
    const redirectUrl = this.getRedirectUrlByRole(user.role_id, user.role?.role_name);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.user_id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role?.role_name || 'Unknown',
      },
      redirect_url: redirectUrl,
    };
  }

  private getRedirectUrlByRole(roleId: number, roleName?: string): string {
    // Role mapping: 1 = Admin, 2 = Landlord, 3 = Tenant
    switch (roleId) {
      case 1:
        return '/admin/dashboard';
      case 2:
        return '/landlord/dashboard';
      case 3:
        return '/tenant/dashboard';
      default:
        // Fallback using role name if available
        if (roleName?.toLowerCase() === 'landlord') {
          return '/landlord/dashboard';
        } else if (roleName?.toLowerCase() === 'tenant') {
          return '/tenant/dashboard';
        } else if (roleName?.toLowerCase() === 'admin') {
          return '/admin/dashboard';
        }
        return '/dashboard';
    }
  }

  public async refreshTokens(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponse> {
    try {
      const { id } = await this.jwtService.verifyAsync<Pick<JWTPayload, 'id'>>(
        refreshTokenDto.refreshToken,
        {
          secret: jwtConfig.secret,
          audience: jwtConfig.audience,
          issuer: jwtConfig.issuer,
        },
      );
      const user = await this.usersService.findById(id);
      return this.generateTokens(user);
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }

  private async signToken<T>(
    userId: number,
    expiresIn: number,
    payload?: T,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: jwtConfig.audience,
        issuer: jwtConfig.issuer,
        secret: jwtConfig.secret,
        expiresIn,
      },
    );
  }
}
