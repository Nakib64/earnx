import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';

@Injectable()
export class ActiveUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User authentication required');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(
        `Account status is ${user.status}. Activation approval is required to access this feature.`,
      );
    }

    return true;
  }
}
