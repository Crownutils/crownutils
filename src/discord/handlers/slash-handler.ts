import type { SlashCommand } from '@/discord/types/command.js';
import { slashCommands } from '@/discord/registries/slash-registry.js';
import {
  hasFunction,
  hasString,
  isObject,
  loadModules,
} from './base-loader.js';

function isSlashCommand(obj: unknown): obj is SlashCommand {
  if (!isObject(obj) || !hasFunction(obj, 'execute')) {
    return false;
  }

  return isObject(obj.data) && hasString(obj.data, 'name');
}

/** Loads all slash command modules and registers each one in {@link slashCommands}. */
export async function loadSlashCommands(): Promise<void> {
  const commands = await loadModules(
    'commands/slash',
    'command',
    isSlashCommand,
  );
  for (const command of commands) {
    slashCommands.set(command.data.name, command);
  }
}
