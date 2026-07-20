/** Where a command is allowed to run. */
export type CommandScope = 'guild' | 'mainGuildOnly' | 'dm' | 'anywhere';

export interface ScopeContext {
  readonly inGuild: boolean;
  /** True only in the configured main guild (implies `inGuild`). */
  readonly inMainGuild: boolean;
}

/** Whether the invocation location satisfies the command's scope. */
export function isScopeSatisfied(
  scope: CommandScope,
  context: ScopeContext,
): boolean {
  switch (scope) {
    case 'anywhere':
      return true;
    case 'guild':
      return context.inGuild;
    case 'mainGuildOnly':
      return context.inMainGuild;
    case 'dm':
      return !context.inGuild;
  }
}
