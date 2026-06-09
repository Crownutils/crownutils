import type {
  CommandAuthorization,
  CommandScope,
  ExecutionContext,
} from '@/types/command.js';

export const AUTHORIZATION_LEVELS = {
  owner: 3,
  privileged: 2,
  public: 1,
} as const satisfies Record<CommandAuthorization, number>;

export const SCOPE_ALLOWED_CONTEXTS: Record<
  CommandScope,
  readonly ExecutionContext[]
> = {
  everywhere: ['dm', 'main_guild', 'other_guild'],
  global: ['main_guild', 'other_guild'],
  main_guild_only: ['main_guild'],
};
