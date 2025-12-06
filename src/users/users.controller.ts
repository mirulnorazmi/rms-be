import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  HttpStatus,
  NotFoundException,
  Delete,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { AccountsUsers } from './interfaces/accounts-users.interface';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';

interface GetUserResponse {
  user: AccountsUsers;
  status: number;
}

interface UpdateResponse {
  message: string;
  status: number;
}

@ApiTags('users')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Find all users' })
  @ApiResponse({ status: 200, description: 'Get all users' })
  public async findAllUser(): Promise<AccountsUsers[]> {
    return this.usersService.findAll();
  }

  @Get('/:userId')
  @ApiOperation({ summary: 'Find a user by id' })
  @ApiResponse({ status: 200, description: 'Get a user by id' })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async findOneUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<AccountsUsers> {
    return this.usersService.findById(userId);
  }

  @Get('/:userId/profile')
  @ApiOperation({ summary: 'Find a user profile by id' })
  @ApiResponse({ status: 200, description: 'Get a user profile by id' })
  @ApiNotFoundResponse({ description: 'User not found' })
  public async getUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<GetUserResponse> {
    const user = await this.findOneUser(userId);

    if (!user) {
      throw new NotFoundException('User does not exist!');
    }

    return {
      user,
      status: HttpStatus.OK,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ description: 'User created successfully' })
  @ApiBadRequestResponse({ description: 'User not created' })
  public async createUser(@Body() userDto: UserDto): Promise<AccountsUsers> {
    return this.usersService.create(userDto);
  }

  @Put('/:userId/profile')
  @ApiOperation({ summary: 'Update a user profile by id' })
  @ApiResponse({ status: 200, description: 'Update a user profile by id' })
  @ApiBadRequestResponse({ description: 'User profile not updated' })
  public async updateUserProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() userProfileDto: UserProfileDto,
  ): Promise<UpdateResponse> {
    try {
      await this.usersService.updateUserProfile(userId, userProfileDto);

      return {
        message: 'User Updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: User not updated!');
    }
  }

  @Put('/:userId')
  @ApiOperation({ summary: 'Update a user by id' })
  @ApiResponse({ status: 200, description: 'Update a user by id' })
  @ApiBadRequestResponse({ description: 'User not updated' })
  public async updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() userUpdateDto: UserUpdateDto,
  ): Promise<UpdateResponse> {
    try {
      await this.usersService.updateUser(userId, userUpdateDto);

      return {
        message: 'User Updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: User not updated!');
    }
  }

  @Delete('/:userId')
  @ApiOperation({ summary: 'Delete a user by id' })
  @ApiResponse({ status: 200, description: 'Delete a user by id' })
  @ApiNoContentResponse({ description: 'User not deleted' })
  public async deleteUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UpdateResponse> {
    await this.usersService.deleteUser(userId);

    return {
      message: 'User deleted successfully!',
      status: HttpStatus.OK,
    };
  }
}
