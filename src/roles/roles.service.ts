import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { UpdateResult, DeleteResult } from 'typeorm';
import { IRole } from './interfaces/role.interface';
import { Roles } from './models/roles.model';
import { RoleDto } from './dto/role.dto';
import { RoleUpdateDto } from './dto/role-update.dto';
import { ROLES_REPOSITORY_TOKEN } from './repositories/roles.repository.interface';
import { RolesTypeOrmRepository } from './repositories/implementations/roles.typeorm.repository';

@Injectable()
export class RolesService {
  constructor(
    @Inject(ROLES_REPOSITORY_TOKEN)
    private readonly rolesRepository: RolesTypeOrmRepository,
  ) {}

  public async findAll(): Promise<Roles[]> {
    return await this.rolesRepository.findAll();
  }

  public async findById(roleId: number): Promise<Roles> {
    const role = await this.rolesRepository.findById(roleId);

    if (!role) {
      throw new NotFoundException(`Role #${roleId} not found`);
    }

    return role;
  }

  public async findByName(roleName: string): Promise<Roles> {
    const role = await this.rolesRepository.findByName(roleName);

    if (!role) {
      throw new NotFoundException(`Role '${roleName}' not found`);
    }

    return role;
  }

  public async create(roleDto: RoleDto): Promise<IRole> {
    try {
      return await this.rolesRepository.create(roleDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async update(
    roleId: number,
    roleUpdateDto: RoleUpdateDto,
  ): Promise<UpdateResult> {
    try {
      const role = await this.findById(roleId);
      if (!role) {
        throw new NotFoundException(`Role #${roleId} not found`);
      }
      return await this.rolesRepository.update(roleId, roleUpdateDto);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async delete(roleId: number): Promise<DeleteResult> {
    const role = await this.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role #${roleId} not found`);
    }
    return await this.rolesRepository.delete(roleId);
  }
}

