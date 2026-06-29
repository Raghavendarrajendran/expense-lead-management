import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/permissions.decorator';
import { InMemoryStore } from '../../store/in-memory.store';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private store: InMemoryStore,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.getAllAndOverride<{ moduleId: string; action: string }>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permission decorator, allow (public route must use @Public())
    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const allowed = this.store.hasPermission(user.roleName, permission.moduleId, permission.action);

    if (!allowed) {
      throw new ForbiddenException(
        `You do not have permission to perform '${permission.action}' on '${permission.moduleId}'`,
      );
    }

    return true;
  }
}
