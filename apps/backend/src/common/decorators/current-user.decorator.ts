import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserAccount } from '@prisma/client';

/**
 * Extracts the authenticated user from the request.
 * @example @CurrentUser() user: UserAccount
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserAccount => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
