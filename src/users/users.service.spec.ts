import { HttpException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { UsersTypeOrmRepository } from './repositories/implementations/users.typeorm.repository';
import { USERS_REPOSITORY_TOKEN } from './repositories/users.repository.interface';

const userArray = [
  {
    user_id: 1,
    role_id: 1,
    email: 'test1@example.com',
    first_name: 'John',
    last_name: 'Doe',
    phone_number: '1234567890',
    password_hash: 'hashed_password_1',
    password_clear: 'cleartext_1',
  },
  {
    user_id: 2,
    role_id: 2,
    email: 'test2@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    phone_number: '0987654321',
    password_hash: 'hashed_password_2',
    password_clear: 'cleartext_2',
  },
];

const oneUser = {
  user_id: 1,
  role_id: 1,
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone_number: '1234567890',
  password_hash: 'hashed_password_1',
  password_clear: 'cleartext_1',
};

const createUser: UserDto = {
  user_id: 1,
  role_id: 1,
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone_number: '1234567890',
  password_hash: 'hashed_password_1',
  password_clear: 'cleartext_1',
};

const updateUserProfile = {
  user_id: 1,
  email: 'updated@example.com',
  first_name: 'John Updated',
  last_name: 'Doe Updated',
  phone_number: '1111111111',
};

const updateUser = {
  user_id: 1,
  role_id: 2,
  email: 'updated@example.com',
  first_name: 'John Updated',
  last_name: 'Doe Updated',
  phone_number: '1111111111',
  password_hash: 'new_hashed_password',
  password_clear: 'new_cleartext',
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersTypeOrmRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USERS_REPOSITORY_TOKEN,
          useValue: {
            findAll: jest.fn().mockResolvedValue(userArray),
            findByEmail: jest.fn().mockResolvedValue(oneUser),
            findById: jest.fn().mockResolvedValueOnce(oneUser),
            create: jest.fn().mockReturnValue(createUser),
            updateUserProfile: jest.fn().mockResolvedValue(updateUserProfile),
            updateUser: jest.fn().mockResolvedValue(updateUser),
            updatePassword: jest.fn().mockResolvedValue({ affected: 1 }),
            deleteUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(USERS_REPOSITORY_TOKEN);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll() method', () => {
    it('should return an array of all users', async () => {
      const users = await service.findAll();
      expect(users).toEqual(userArray);
    });
  });

  describe('findByEmail() method', () => {
    it('should find a user by email', async () => {
      expect(await service.findByEmail('test@example.com')).toEqual(oneUser);
    });

    it('should throw an exception if it not found a user by email', async () => {
      repository.findByEmail = jest.fn().mockResolvedValueOnce(null);
      await expect(service.findByEmail('not a correct email')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById() method', () => {
    it('should find a user by id', async () => {
      expect(await service.findById(1)).toEqual(oneUser);
    });

    it('should throw an exception if it not found a user by id', async () => {
      repository.findById = jest.fn().mockResolvedValueOnce(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create() method', () => {
    it('should create a new user', async () => {
      expect(await service.create(createUser)).toEqual(createUser);
    });

    it('should return an exception if create fails', async () => {
      repository.create = jest.fn().mockRejectedValueOnce(null);
      await expect(
        service.create({
          user_id: 1,
          role_id: 1,
          email: 'not a correct email',
          first_name: 'John',
          last_name: 'Doe',
          phone_number: '1234567890',
          password_hash: 'hashed_password',
          password_clear: 'cleartext',
        }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('updateUserProfile() method', () => {
    it('should update profile of a user by id', async () => {
      expect(await service.updateUserProfile(1, updateUserProfile)).toEqual(
        updateUserProfile,
      );
    });

    it('should return an exception if update profile user fails', async () => {
      repository.updateUserProfile = jest.fn().mockRejectedValueOnce(null);
      await expect(
        service.updateUserProfile(1, {
          user_id: 1,
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          phone_number: '1234567890',
        }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('updateUser() method', () => {
    it('should update a user by id', async () => {
      expect(await service.updateUser(1, updateUser)).toEqual(updateUser);
    });

    it('should return an exception if update user fails', async () => {
      repository.updateUser = jest.fn().mockRejectedValueOnce(null);
      await expect(
        service.updateUser(1, {
          role_id: 1,
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          phone_number: '1234567890',
          password_hash: 'hashed_password',
          password_clear: 'cleartext',
        }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('updatePassword() method', () => {
    it('should update password of a user by id', async () => {
      repository.findById = jest.fn().mockResolvedValueOnce(oneUser);
      const result = await service.updatePassword(1, 'new_hashed_password');
      expect(result).toEqual({ affected: 1 });
    });

    it('should return an exception if update password fails', async () => {
      repository.findById = jest.fn().mockResolvedValueOnce(oneUser);
      repository.updatePassword = jest.fn().mockRejectedValueOnce(null);
      await expect(
        service.updatePassword(1, 'new_hashed_password'),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('deleteUser() method', () => {
    it('should remove a user by id', async () => {
      const removeSpy = jest.spyOn(repository, 'deleteUser');
      const user = await service.deleteUser(1);
      expect(removeSpy).toHaveBeenCalledWith(1);
      expect(user).toBeUndefined();
    });

    it('should throw an error if no user is found with an id', async () => {
      repository.findById = jest.fn().mockResolvedValueOnce(undefined);
      await expect(service.deleteUser(999)).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledTimes(1);
    });
  });
});
