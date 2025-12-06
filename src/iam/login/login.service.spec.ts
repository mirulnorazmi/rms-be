import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { HashingService } from '../../common/hashing/hashing.service';
import { LoginService } from './login.service';
import { UsersService } from '../../users/users.service';
import { Users } from '../../users/models/users.model';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException, HttpException } from '@nestjs/common';

const oneUser = {
  user_id: 1,
  role_id: 1,
  role: {
    role_id: 1,
    role_name: 'Admin',
  },
  first_name: 'John',
  last_name: 'Doe',
  email: 'test@example.com',
  phone_number: '1234567890',
  password_hash: 'pass123',
  password_clear: 'pass123',
};

const loginDto: LoginDto = {
  email: 'test@example.com',
  password_clear: 'pass123',
};

const userLogin = {
  accessToken: undefined as any,
  refreshToken: undefined as any,
  user: {
    id: 1,
    name: 'John Doe',
    email: 'test@example.com',
    role_id: 1,
    role_name: 'Admin',
  },
  redirect_url: '/admin/dashboard',
};

const payload = {
  id: 1,
  name: 'John Doe',
  email: 'test@example.com',
};

const refreshTokenDto = {
  refreshToken: 'token',
};

const id = 1;

const jwtConfig = {
  secret: 'test-secret',
  audience: 'test-audience',
  issuer: 'test-issuer',
  accessTokenTtl: 3600,
  refreshTokenTtl: 86400,
};

describe('LoginService', () => {
  let loginService: LoginService;
  let usersService: UsersService;
  let hashingService: HashingService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            signToken: jest.fn(() => payload),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: 'jwtConfig',
          useValue: jwtConfig,
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(() => Promise.resolve('pass123')),
            compare: jest.fn(() => Promise.resolve(true)),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn().mockResolvedValue(oneUser),
            findById: jest.fn().mockResolvedValue(oneUser),
          },
        },
        {
          provide: getRepositoryToken(Users),
          useValue: {
            findByEmail: jest.fn(),
            findOneBy: jest.fn().mockReturnValue(oneUser),
            findOne: jest.fn().mockReturnValue(oneUser),
            findBySub: jest.fn().mockReturnValueOnce(oneUser),
          },
        },
      ],
    }).compile();

    loginService = module.get<LoginService>(LoginService);
    usersService = module.get<UsersService>(UsersService);
    hashingService = module.get<HashingService>(HashingService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(loginService).toBeDefined();
  });

  describe('findUserByEmail() method', () => {
    it('should find a user by email', async () => {
      expect(await loginService.findUserByEmail(loginDto)).toEqual(oneUser);
    });

    it('should generate token jwt', async () => {
      expect(await loginService.login(loginDto)).toEqual(userLogin);
    });

    it('should generate refresh token jwt', async () => {
      usersService.findById = jest.fn().mockResolvedValueOnce(oneUser);
      jwtService.verifyAsync = jest.fn(() => id as any);

      expect(
        await loginService.refreshTokens({
          refreshToken: 'token',
        }),
      ).toEqual(userLogin);
    });

    it('should return an exception if refresh token fails', async () => {
      usersService.findById = jest.fn().mockResolvedValueOnce(null);
      await expect(
        loginService.refreshTokens({
          refreshToken: 'not a correct token jwt',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return an exception if wrong password', async () => {
      usersService.findByEmail = jest.fn().mockResolvedValueOnce(oneUser);
      hashingService.compare = jest.fn().mockResolvedValueOnce(false);
      await expect(
        loginService.login({
          email: 'someemail@test.com',
          password_clear: 'not a correct password',
        }),
      ).rejects.toThrow(HttpException);
    });

    it('should return an exception if login fails', async () => {
      usersService.findByEmail = jest.fn().mockResolvedValueOnce(null);
      await expect(
        loginService.login({
          email: 'not a correct email',
          password_clear: 'not a correct password',
        }),
      ).rejects.toThrow(HttpException);
    });
  });
});
