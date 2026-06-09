import type { CommandPermission } from '@/types/command.js';

export const PERMISSION_LABELS = {
  owner: 'propriétaire',
  privileged: 'privilégié',
  public: 'public',
  main_guild_only: 'serveur principal uniquement',
  global: 'serveurs',
  everywhere: 'partout',
} as const satisfies Record<CommandPermission, string>;
