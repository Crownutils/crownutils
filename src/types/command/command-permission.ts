import type { CommandAuthorization, CommandScope } from './command.js';

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
