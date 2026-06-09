import type { CommandAuthorization } from './command.js';

export type ExecutionContext = 'dm' | 'main_guild' | 'other_guild';

export interface CommandExecutionContext {
  context: ExecutionContext;
  authorization: CommandAuthorization;
}
