import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../users/users.service';
import { RegisterService } from './register.service';
import { Users } from '../../users/models/users.model';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { HashingService } from '../../common/hashing/hashing.service';
import { MailerService } from '../../common/mailer/mailer.service';
import { Repository } from 'typeorm';

const registerUserDto: RegisterUserDto = {
  user_id: 1,
  role_id: 1,
  password_hash: 'password123',
  first_name: 'name #1',
  last_name: 'username #1',
  email: 'test@example.com',
  password_clear: 'password123',
};

describe('RegisterService', () => {
  let service: RegisterService;
  let repository: Repository<Users>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue(registerUserDto),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Users),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RegisterService>(RegisterService);
    repository = module.get<Repository<Users>>(getRepositoryToken(Users));
  });

  describe('Create user', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create a user during registration', async () => {
      expect(
        await service.register({
          user_id: 1,
          role_id: 1,
          first_name: 'name #1',
          last_name: 'username #1',
          email: 'test@example.com',
          password_hash: 'password123',
          password_clear: 'password123',
        }),
      ).toEqual(registerUserDto);
    });
  });
});
