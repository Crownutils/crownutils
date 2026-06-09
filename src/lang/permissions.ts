import type {
  CommandAuthorization,
  CommandScope,
} from '@/types/command/command.js';

export const PERMISSION_LABELS = {
  owner: 'propriétaire',
  privileged: 'privilégié',
  public: 'public',
  main_guild: 'serveur principal',
  global: 'serveurs',
  everywhere: 'partout',
} as const satisfies Record<CommandScope | CommandAuthorization, string>;
