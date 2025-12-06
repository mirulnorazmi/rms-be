import { Roles } from '../../models/roles.model';
import { RolesRepository } from '../roles.repository.interface';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { RoleDto } from '../../dto/role.dto';
import { RoleUpdateDto } from '../../dto/role-update.dto';
import { IRole } from '../../interfaces/role.interface';

export class RolesTypeOrmRepository implements RolesRepository {
  constructor(private readonly rolesRepository: Repository<Roles>) {}

  public async findAll(): Promise<Roles[]> {
    return await this.rolesRepository.find();
  }

  public async findById(roleId: number): Promise<Roles | null> {
    return await this.rolesRepository.findOneBy({
      role_id: roleId,
    });
  }

  public async findByName(roleName: string): Promise<Roles | null> {
    return await this.rolesRepository.findOneBy({
      role_name: roleName,
    });
  }

  public async create(roleDto: RoleDto): Promise<IRole> {
    return await this.rolesRepository.save(roleDto);
  }

  public async update(
    roleId: number,
    roleUpdateDto: RoleUpdateDto,
  ): Promise<UpdateResult> {
    return await this.rolesRepository.update(
      { role_id: roleId },
      { ...roleUpdateDto },
    );
  }

  public async delete(roleId: number): Promise<DeleteResult> {
    return await this.rolesRepository.delete({ role_id: roleId });
  }
}

