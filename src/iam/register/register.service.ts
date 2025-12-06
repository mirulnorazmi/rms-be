import { Injectable, Logger } from '@nestjs/common';
import { HashingService } from '../../common/hashing/hashing.service';
import { MailerService } from '../../common/mailer/mailer.service';
import { AccountsUsers } from '../../users/interfaces/accounts-users.interface';
import { UsersService } from '../../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterLandlordDto } from './dto/register-landlord.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { registrationEmail } from '../../common/mailer/mailer.constants';

// Role IDs
const LANDLORD_ROLE_ID = 2;
const TENANT_ROLE_ID = 3;

@Injectable()
export class RegisterService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
    private readonly hashingService: HashingService,
  ) {}

  public async register(
    registerUserDto: RegisterUserDto,
  ): Promise<AccountsUsers> {
    registerUserDto.password_hash = await this.hashingService.hash(
      registerUserDto.password_clear,
    );

    // this.sendMailRegisterUser(registerUserDto).catch((err: unknown) =>
    //   Logger.error('Send mail failed but continuing registration', err),
    // );

    return this.usersService.create(registerUserDto);
  }

  /**
   * Register a new landlord (role_id = 2)
   */
  public async registerLandlord(
    registerLandlordDto: RegisterLandlordDto,
  ): Promise<AccountsUsers> {
    const password_hash = await this.hashingService.hash(
      registerLandlordDto.password_clear,
    );

    const userDto = {
      role_id: LANDLORD_ROLE_ID,
      email: registerLandlordDto.email,
      first_name: registerLandlordDto.first_name,
      last_name: registerLandlordDto.last_name,
      phone_number: registerLandlordDto.phone_number,
      password_hash,
      password_clear: registerLandlordDto.password_clear,
    };

    return this.usersService.create(userDto as RegisterUserDto);
  }

  /**
   * Register a new tenant (role_id = 3)
   */
  public async registerTenant(
    registerTenantDto: RegisterTenantDto,
  ): Promise<AccountsUsers> {
    const password_hash = await this.hashingService.hash(
      registerTenantDto.password_clear,
    );

    const userDto = {
      role_id: TENANT_ROLE_ID,
      email: registerTenantDto.email,
      first_name: registerTenantDto.first_name,
      last_name: registerTenantDto.last_name,
      phone_number: registerTenantDto.phone_number,
      password_hash,
      password_clear: registerTenantDto.password_clear,
    };

    return this.usersService.create(userDto as RegisterUserDto);
  }

  private async sendMailRegisterUser(user: RegisterUserDto): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: 'from@example.com',
        subject: 'Registration successful ✔',
        html: registrationEmail(user),
      });
      Logger.log('User Registration: Send Mail successfully!', 'MailService');
    } catch (err: unknown) {
      Logger.error('User Registration: Send Mail failed!', err);
    }
  }
}
