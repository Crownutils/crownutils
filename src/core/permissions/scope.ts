import { env } from '@/core/config/index.js';
import type { CommandScope, ExecutionContext } from './types.js';

/** Resolves the {@link ExecutionContext} for a guild id (`null` means a DM). */
export function resolveExecutionContext(
  guildId: string | null,
): ExecutionContext {
  switch (guildId) {
    case null:
      return 'dm';

    case env.mainGuildId:
      return 'main_guild';

    default:
      return 'other_guild';
  }
}

/** Returns whether `context` satisfies `requiredScope`. */
export function isScopeAllowed(
  requiredScope: CommandScope,
  context: ExecutionContext,
): boolean {
  switch (requiredScope) {
    case 'everywhere':
      return true;

    case 'global':
      return context === 'main_guild' || context === 'other_guild';

    case 'main_guild':
      return context === 'main_guild';
  }
}
