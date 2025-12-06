import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class LandlordGuard implements CanActivate {
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

    // Check if user role is 'Landlord' (case-insensitive)
    const isLandlord = user.role.role_name.toLowerCase() === 'landlord';

    if (!isLandlord) {
      throw new ForbiddenException('Access denied. Landlord role required.');
    }

    // Attach landlord user to request for later use
    request.landlord = user;

    return true;
  }
}

