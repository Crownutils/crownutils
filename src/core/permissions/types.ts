export type CommandAuthorization = 'owner' | 'privileged' | 'public';
export type CommandScope = 'everywhere' | 'global' | 'main_guild';

export interface CommandRequirements {
  scope?: CommandScope;
  authorization?: CommandAuthorization;
}

export type ExecutionContext = 'dm' | 'main_guild' | 'other_guild';

export interface CommandExecutionContext {
  context: ExecutionContext;
  authorization: CommandAuthorization;
}

export type CommandPermissionError =
  | {
      type: 'scope';
      required: CommandScope;
    }
  | {
      type: 'authorization';
      required: CommandAuthorization;
      current: CommandAuthorization;
    };

export interface CommandValidation {
  canBeExecuted: boolean;
  errors: CommandPermissionError[];
}
