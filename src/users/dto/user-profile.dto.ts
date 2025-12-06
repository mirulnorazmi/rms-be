import { OmitType } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class UserProfileDto extends OmitType(UserDto, ['role_id', 'password_hash', 'password_clear'] as const) {}
