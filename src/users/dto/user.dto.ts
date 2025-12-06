import { MaxLength, IsNotEmpty, IsEmail, IsString, IsInt, IsOptional } from 'class-validator';

export class UserDto {
  @IsInt()
  readonly user_id: number;

  @IsInt()
  @IsNotEmpty()
  readonly role_id: number;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly first_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly last_name: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  readonly phone_number?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password_hash: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password_clear: string;
}
