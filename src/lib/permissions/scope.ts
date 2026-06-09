import type { ExecutionContext } from '@/types/command/command-context.js';
import { env } from '../env.js';
import type { CommandScope } from '@/types/command/command.js';

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
