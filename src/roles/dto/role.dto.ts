import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly role_name: string;
}

