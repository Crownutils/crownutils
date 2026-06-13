/** Authorization tiers, from least to most privileged. */
export type CommandAuthorization = 'owner' | 'privileged' | 'public';

/** Where a command is allowed to run. */
export type CommandScope = 'everywhere' | 'global' | 'main_guild';

/** Scope/authorization requirements declared by a command. */
export interface CommandRequirements {
  scope?: CommandScope;
  authorization?: CommandAuthorization;
}

/** Where an interaction originated: a DM, the main guild, or another guild. */
export type ExecutionContext = 'dm' | 'main_guild' | 'other_guild';

/** Resolved scope and authorization for the user invoking a command. */
export interface CommandExecutionContext {
  context: ExecutionContext;
  authorization: CommandAuthorization;
}

/** Reason a command's requirements were not met. */
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

/** Result of {@link checkCommandRequirements}. */
export interface CommandValidation {
  canBeExecuted: boolean;
  errors: CommandPermissionError[];
}
