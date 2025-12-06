import { Test, TestingModule } from '@nestjs/testing';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';
import { UsersService } from '../../users/users.service';
import { MailerService } from '../../common/mailer/mailer.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { BadRequestException } from '@nestjs/common';

const registerUserDto: RegisterUserDto = {
  user_id: 1,
  role_id: 1,
  first_name: 'name #1',
  last_name: 'username #1',
  email: 'test@example.com',
  password_clear: 'password123',
  password_hash: 'password123',
};

describe('Register Controller', () => {
  let registerController: RegisterController;
  let registerService: RegisterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegisterController],
      providers: [
        RegisterService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            register: jest.fn(() => {}),
          },
        },
        {
          provide: RegisterService,
          useValue: {
            register: jest.fn(() => {}),
          },
        },
      ],
    }).compile();

    registerController = module.get<RegisterController>(RegisterController);
    registerService = module.get<RegisterService>(RegisterService);
  });

  describe('Registration user', () => {
    it('should be defined', () => {
      expect(registerController).toBeDefined();
    });

    it('should call method register in registerService', async () => {
      const createSpy = jest.spyOn(registerService, 'register');

      await registerController.register(registerUserDto);
      expect(createSpy).toHaveBeenCalledWith(registerUserDto);
    });

    it('should throw an exception if it not register fails', async () => {
      registerService.register = jest.fn().mockRejectedValueOnce(null);
      await expect(
        registerController.register({
          user_id: 1,
          role_id: 1,
          first_name: 'not a correct name',
          last_name: 'not a correct username',
          email: 'not a correct email',
          password_hash: 'not a correct password',
          password_clear: 'not a correct password',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
