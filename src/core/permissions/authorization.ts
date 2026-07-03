import { isOwner, isPrivileged } from './user.js';

/** Who is allowed to run a command. */
export type Authorization = 'everyone' | 'privileged' | 'owner';

export interface AuthorizationContext {
  readonly userId: string;
  readonly ownerId: string;
  readonly privilegedIds: readonly string[];
}

/** Whether the invoking user satisfies the command's authorization level. */
export function isAuthorized(
  authorization: Authorization,
  context: AuthorizationContext,
): boolean {
  switch (authorization) {
    case 'everyone':
      return true;
    case 'privileged':
      return isPrivileged(context.userId, context.privilegedIds);
    case 'owner':
      return isOwner(context.userId, context.ownerId);
  }
}
