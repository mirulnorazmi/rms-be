import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserDto } from './dto/user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const userDto: UserDto = {
  user_id: 1,
  role_id: 1,
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone_number: '1234567890',
  password_hash: 'hashed_password_123',
  password_clear: 'cleartext_password',
};

const userUpdateDto: UserDto = {
  user_id: 1,
  role_id: 2,
  email: 'updated@example.com',
  first_name: 'John Updated',
  last_name: 'Doe Updated',
  phone_number: '1111111111',
  password_hash: 'new_hashed_password',
  password_clear: 'new_cleartext',
};

const userProfileDto: UserProfileDto = {
  user_id: 1,
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone_number: '1234567890',
};

const mockUser = {
  user_id: 1,
  role_id: 1,
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone_number: '1234567890',
  password_hash: 'hashed_password_123',
  password_clear: 'cleartext_password',
};

describe('Users Controller', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(() => [mockUser]),
            findById: jest.fn(() => mockUser),
            create: jest.fn(() => mockUser),
            updateUserProfile: jest.fn(() => {}),
            updateUser: jest.fn(() => {}),
            updatePassword: jest.fn(() => ({ affected: 1 })),
            deleteUser: jest.fn(() => {}),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('Users Controller', () => {
    it('should be defined', () => {
      expect(usersController).toBeDefined();
    });

    describe('findAllUser() method', () => {
      it('should call method findAllUser in userService', async () => {
        const createSpy = jest.spyOn(usersService, 'findAll');

        await usersController.findAllUser();
        expect(createSpy).toHaveBeenCalled();
      });
    });

    describe('findOneUser() method', () => {
      it('should call method findOneUser in userService', async () => {
        const createSpy = jest.spyOn(usersService, 'findById');

        await usersController.findOneUser(1);
        expect(createSpy).toHaveBeenCalledWith(1);
      });
    });

    describe('getUser() method', () => {
      it('should call method getUser in userService', async () => {
        const createSpy = jest.spyOn(usersService, 'findById');

        await usersController.getUser(1);
        expect(createSpy).toHaveBeenCalledWith(1);
      });

      it('should return an exception if user not found', async () => {
        usersService.findById = jest.fn().mockResolvedValueOnce(null);
        await expect(usersController.getUser(999)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('createUser() method', () => {
      it('should call method create in userService', async () => {
        const createSpy = jest.spyOn(usersService, 'create');

        await usersController.createUser(userDto);
        expect(createSpy).toHaveBeenCalledWith(userDto);
      });
    });

    describe('updateUserProfile() method', () => {
      it('should call method updateUserProfile in userService', async () => {
        const createSpy = jest.spyOn(usersService, 'updateUserProfile');

        await usersController.updateUserProfile(1, userProfileDto);
        expect(createSpy).toHaveBeenCalledWith(1, userProfileDto);
      });

      it('should return an exception if update profile user fails', async () => {
        usersService.updateUserProfile = jest.fn().mockRejectedValueOnce(null);
        await expect(
          usersController.updateUserProfile(1, userProfileDto),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('updateUser() method', () => {
      it('should call method updateUser in userService', async () => {
        const createSpy = jest.spyOn(usersService, 'updateUser');

        await usersController.updateUser(1, userUpdateDto);
        expect(createSpy).toHaveBeenCalledWith(1, userUpdateDto);
      });

      it('should return an exception if update user fails', async () => {
        usersService.updateUser = jest.fn().mockRejectedValueOnce(null);
        await expect(
          usersController.updateUser(1, userUpdateDto),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('deleteUser() method', () => {
      it('should call method deleteUser in userService', async () => {
        const createSpy = jest.spyOn(usersService, 'deleteUser');

        await usersController.deleteUser(1);
        expect(createSpy).toHaveBeenCalledWith(1);
      });
    });
  });
});
