import type {
  CommandAuthorization,
  CommandScope,
} from '@/core/permissions/types.js';

/** French labels for each {@link CommandScope}/{@link CommandAuthorization} value. */
export const PERMISSION_LABELS = {
  owner: 'propriétaire',
  privileged: 'privilégié',
  public: 'public',
  main_guild: 'serveur principal',
  global: 'serveurs',
  everywhere: 'partout',
} as const satisfies Record<CommandScope | CommandAuthorization, string>;
