import {
  hasFunction,
  hasString,
  isObject,
  loadModules,
} from '@/discord/handlers/base-loader.js';
import { prefixCommands } from '@/discord/registries/prefix-registry.js';
import type { PrefixCommand } from '@/discord/types/command.js';

function isPrefixCommand(obj: unknown): obj is PrefixCommand {
  return isObject(obj) && hasString(obj, 'name') && hasFunction(obj, 'execute');
}

/**
 * Loads all prefix command modules and registers each one in
 * {@link prefixCommands} under its `name` and every entry in `aliases`.
 */
export async function loadPrefixCommands(): Promise<void> {
  const commands = await loadModules(
    'commands/prefix',
    'command',
    isPrefixCommand,
  );
  for (const command of commands) {
    prefixCommands.set(command.name, command);
    if (command.aliases) {
      for (const alias of command.aliases) {
        prefixCommands.set(alias, command);
      }
    }
  }
}
