import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { AccountsUsers } from './interfaces/accounts-users.interface';
import { Users } from './models/users.model';
import { UserDto } from './dto/user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { USERS_REPOSITORY_TOKEN } from './repositories/users.repository.interface';
import { UsersTypeOrmRepository } from './repositories/implementations/users.typeorm.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY_TOKEN)
    private readonly usersRepository: UsersTypeOrmRepository,
  ) {}

  public async findAll(): Promise<Users[]> {
    return await this.usersRepository.findAll();
  }

  public async findByEmail(email: string): Promise<Users> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  public async findById(userId: number): Promise<Users> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    return user;
  }

  public async create(userDto: UserDto): Promise<AccountsUsers> {
    try {
      return await this.usersRepository.create(userDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updateUserProfile(
    id: number,
    userProfileDto: UserProfileDto,
  ): Promise<Users> {
    try {
      return await this.usersRepository.updateUserProfile(id, userProfileDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updateUser(
    id: number,
    userUpdateDto: UserUpdateDto,
  ): Promise<UpdateResult> {
    try {
      return await this.usersRepository.updateUser(id, userUpdateDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updatePassword(
    id: number,
    passwordHash: string,
  ): Promise<UpdateResult> {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new NotFoundException(`User #${id} not found`);
      }
      return await this.usersRepository.updatePassword(id, passwordHash);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updatePasswordByEmail(
    email: string,
    passwordHash: string,
  ): Promise<Users> {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      return await this.usersRepository.updatePasswordByEmail(
        email,
        passwordHash,
      );
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async deleteUser(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return await this.usersRepository.deleteUser(id);
  }
}
