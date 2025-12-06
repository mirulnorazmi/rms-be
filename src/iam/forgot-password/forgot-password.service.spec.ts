import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from '../../users/models/users.model';
import { ForgotPasswordService } from './forgot-password.service';
import { MailerService } from '../../common/mailer/mailer.service';
import { UtilsService } from '../../common/utils/utils.service';
import { HashingService } from '../../common/hashing/hashing.service';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/users.service';

const oneUser = {
  user_id: 1,
  role_id: 1,
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone_number: '1234567890',
  password_hash: 'hashed_password',
  password_clear: 'cleartext',
};

const savedUser = {
  user_id: 1,
  role_id: 1,
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone_number: '1234567890',
  password_hash: 'pass123',
  password_clear: 'cleartext',
};

describe('ForgotPasswordService', () => {
  let service: ForgotPasswordService;
  let repository: Repository<Users>;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordService,
        {
          provide: UsersService,
          useValue: {
            forgotPassword: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Users),
          useValue: {
            findOneBy: jest.fn(() => oneUser),
            save: jest.fn(() => savedUser),
          },
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(() => 'pass123'),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        UtilsService,
      ],
    }).compile();

    service = module.get<ForgotPasswordService>(ForgotPasswordService);
    mailerService = module.get<MailerService>(MailerService);
    repository = module.get<Repository<Users>>(getRepositoryToken(Users));
  });

  describe('forgot password user', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should generate a new password for user by email', async () => {
      expect(
        await service.forgotPassword({
          email: 'test@example.com',
        }),
      ).toEqual(savedUser);
    });
  });
});
