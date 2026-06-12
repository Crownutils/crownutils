import { env } from '@/core/config/index.js';
import type { CommandScope, ExecutionContext } from './types.js';

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
