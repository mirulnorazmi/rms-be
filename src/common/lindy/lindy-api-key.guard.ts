import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Guard to authenticate Lindy AI webhook callbacks using API Key
 * Add this guard to endpoints that Lindy needs to access
 */
@Injectable()
export class LindyApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-lindy-api-key'] as string;
    const expectedApiKey = process.env.LINDY_API_KEY;

    if (!expectedApiKey) {
      throw new UnauthorizedException('LINDY_API_KEY not configured on server');
    }

    if (!apiKey || apiKey !== expectedApiKey) {
      throw new UnauthorizedException('Invalid Lindy API key');
    }

    return true;
  }
}

