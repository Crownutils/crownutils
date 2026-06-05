import { loadModules } from '@/handlers/base-loader.js';
import { prefixCommands } from '@/registries/prefix-registry.js';
import type { PrefixCommand } from '@/types/command.js';

function isPrefixCommand(obj: unknown): obj is PrefixCommand {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const candidate = obj as Record<string, unknown>;
  if (typeof candidate.name !== 'string') {
    return false;
  }

  if (typeof candidate.execute !== 'function') {
    return false;
  }

  return true;
}

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
