import { env } from '@/core/config/index.js';
import type { CommandAuthorization } from './types.js';

/** Numeric ranking of {@link CommandAuthorization} tiers; higher is more privileged. */
export const AUTHORIZATION_LEVELS = {
  owner: 3,
  privileged: 2,
  public: 1,
} as const satisfies Record<CommandAuthorization, number>;

/** Resolves a user's authorization tier from `env.ownerId` / `env.privilegedIds`. */
export function resolveAuthorization(userId: string): CommandAuthorization {
  switch (userId) {
    case env.ownerId:
      return 'owner';

    default:
      return env.privilegedIds.includes(userId) ? 'privileged' : 'public';
  }
}

/** Returns whether `userAuthorization` meets or exceeds `requiredAuthorization`. */
export function isAuthorizationAllowed(
  requiredAuthorization: CommandAuthorization,
  userAuthorization: CommandAuthorization,
): boolean {
  return (
    AUTHORIZATION_LEVELS[userAuthorization] >=
    AUTHORIZATION_LEVELS[requiredAuthorization]
  );
}
