import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

export const RequirePermission = (moduleId: string, action: string) =>
  SetMetadata(PERMISSION_KEY, { moduleId, action });
