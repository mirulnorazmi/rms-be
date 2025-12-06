import { UserProfileDto } from '../dto/user-profile.dto';
import { UserUpdateDto } from '../dto/user-update.dto';
import { UserDto } from '../dto/user.dto';

export interface UsersRepository {
  findAll(): void;
  findByEmail(email: string): void;
  findById(userId: number): void;
  create(userDto: UserDto): void;
  updateUserProfile(id: number, userProfileDto: UserProfileDto): void;
  updateUser(id: number, userUpdateDto: UserUpdateDto): void;
  updatePassword(id: number, passwordHash: string): void;
  updatePasswordByEmail(email: string, passwordHash: string): void;
  deleteUser(id: number): void;
}

export const USERS_REPOSITORY_TOKEN = 'users-repository-token';
