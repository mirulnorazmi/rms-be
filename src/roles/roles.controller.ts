import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleDto } from './dto/role.dto';
import { RoleUpdateDto } from './dto/role-update.dto';
import { IRole } from './interfaces/role.interface';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../iam/login/decorators/auth-guard.decorator';
import { AuthType } from '../iam/login/enums/auth-type.enum';

interface ApiResponseMessage {
  message: string;
  status: number;
}

@ApiTags('roles')
@ApiBearerAuth()
@AuthGuard(AuthType.Bearer)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Find all roles' })
  @ApiResponse({ status: 200, description: 'Get all roles' })
  public async findAll(): Promise<IRole[]> {
    return this.rolesService.findAll();
  }

  @Get('/:roleId')
  @ApiOperation({ summary: 'Find a role by id' })
  @ApiResponse({ status: 200, description: 'Get a role by id' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  public async findOne(
    @Param('roleId', ParseIntPipe) roleId: number,
  ): Promise<IRole> {
    return this.rolesService.findById(roleId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiCreatedResponse({ description: 'Role created successfully' })
  @ApiBadRequestResponse({ description: 'Role not created' })
  public async create(@Body() roleDto: RoleDto): Promise<IRole> {
    return this.rolesService.create(roleDto);
  }

  @Put('/:roleId')
  @ApiOperation({ summary: 'Update a role by id' })
  @ApiResponse({ status: 200, description: 'Update a role by id' })
  @ApiBadRequestResponse({ description: 'Role not updated' })
  public async update(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() roleUpdateDto: RoleUpdateDto,
  ): Promise<ApiResponseMessage> {
    try {
      await this.rolesService.update(roleId, roleUpdateDto);

      return {
        message: 'Role updated successfully!',
        status: HttpStatus.OK,
      };
    } catch (err) {
      throw new BadRequestException(err, 'Error: Role not updated!');
    }
  }

  @Delete('/:roleId')
  @ApiOperation({ summary: 'Delete a role by id' })
  @ApiResponse({ status: 200, description: 'Delete a role by id' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  public async delete(
    @Param('roleId', ParseIntPipe) roleId: number,
  ): Promise<ApiResponseMessage> {
    await this.rolesService.delete(roleId);

    return {
      message: 'Role deleted successfully!',
      status: HttpStatus.OK,
    };
  }
}

