import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator to restrict access to specific roles.
 * @example @Roles(Role.Admin, Role.Manager)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
