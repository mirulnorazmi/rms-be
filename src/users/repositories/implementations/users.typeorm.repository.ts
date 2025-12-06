import { Users } from '../../models/users.model';
import { UsersRepository } from '../users.repository.interface';
import { Repository, UpdateResult } from 'typeorm';
import { UserProfileDto } from '../../dto/user-profile.dto';
import { UserUpdateDto } from '../../dto/user-update.dto';
import { UserDto } from '../../dto/user.dto';
import { AccountsUsers } from '../../interfaces/accounts-users.interface';

export class UsersTypeOrmRepository implements UsersRepository {
  constructor(private readonly usersRepository: Repository<Users>) {}

  public async findAll(): Promise<Users[]> {
    return await this.usersRepository.find({
      relations: ['role'],
    });
  }

  public async findByEmail(email: string): Promise<Users | null> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  public async findById(userId: number): Promise<Users | null> {
    return await this.usersRepository.findOne({
      where: { user_id: userId },
      relations: ['role'],
    });
  }

  public async create(userDto: UserDto): Promise<AccountsUsers> {
    // Exclude password_clear from being saved to database
    const { password_clear, ...userToSave } = userDto;
    return await this.usersRepository.save(userToSave);
  }

  public async updateUserProfile(
    id: number,
    userProfileDto: UserProfileDto,
  ): Promise<Users> {
    const user = await this.usersRepository.findOneBy({ user_id: id });
    user.email = userProfileDto.email;
    user.first_name = userProfileDto.first_name;
    user.last_name = userProfileDto.last_name;
    user.phone_number = userProfileDto.phone_number;

    return await this.usersRepository.save(user);
  }

  public async updateUser(
    id: number,
    userUpdateDto: UserUpdateDto,
  ): Promise<UpdateResult> {
    return await this.usersRepository.update(
      { user_id: id },
      { ...userUpdateDto },
    );
  }

  public async updatePassword(
    id: number,
    passwordHash: string,
  ): Promise<UpdateResult> {
    return await this.usersRepository.update(
      { user_id: id },
      { password_hash: passwordHash },
    );
  }

  public async updatePasswordByEmail(
    email: string,
    passwordHash: string,
  ): Promise<Users> {
    const user = await this.usersRepository.findOneBy({ email });
    user.password_hash = passwordHash;
    // password_clear is NOT stored in database for security reasons

    return await this.usersRepository.save(user);
  }

  public async deleteUser(userId: number): Promise<void> {
    await this.usersRepository.delete({ user_id: userId });
  }
}
