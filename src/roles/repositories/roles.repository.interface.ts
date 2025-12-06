import { RoleDto } from '../dto/role.dto';
import { RoleUpdateDto } from '../dto/role-update.dto';

export interface RolesRepository {
  findAll(): void;
  findById(roleId: number): void;
  findByName(roleName: string): void;
  create(roleDto: RoleDto): void;
  update(roleId: number, roleUpdateDto: RoleUpdateDto): void;
  delete(roleId: number): void;
}

export const ROLES_REPOSITORY_TOKEN = 'roles-repository-token';

