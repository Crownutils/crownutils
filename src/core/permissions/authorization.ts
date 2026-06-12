import { env } from '@/core/config/index.js';
import type { CommandAuthorization } from './types.js';

export const AUTHORIZATION_LEVELS = {
  owner: 3,
  privileged: 2,
  public: 1,
} as const satisfies Record<CommandAuthorization, number>;

export function resolveAuthorization(userId: string): CommandAuthorization {
  switch (userId) {
    case env.ownerId:
      return 'owner';

    default:
      return env.privilegedIds.includes(userId) ? 'privileged' : 'public';
  }
}

export function isAuthorizationAllowed(
  requiredAuthorization: CommandAuthorization,
  userAuthorization: CommandAuthorization,
): boolean {
  return (
    AUTHORIZATION_LEVELS[userAuthorization] >=
    AUTHORIZATION_LEVELS[requiredAuthorization]
  );
}
