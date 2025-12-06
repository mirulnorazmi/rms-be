import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const user = await this.usersService.findById(userId);

    if (!user || !user.role) {
      throw new ForbiddenException('User not found');
    }

    // Check if user role is 'Tenant' (case-insensitive)
    const isTenant = user.role.role_name.toLowerCase() === 'tenant';

    if (!isTenant) {
      throw new ForbiddenException('Access denied. Tenant role required.');
    }

    // Attach tenant user to request for later use
    request.tenant = user;

    return true;
  }
}

