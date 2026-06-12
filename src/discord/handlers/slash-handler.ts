import type { SlashCommand } from '@/discord/types/command.js';
import { slashCommands } from '@/discord/registries/slash-registry.js';
import { loadModules } from './base-loader.js';

function isSlashCommand(obj: unknown): obj is SlashCommand {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const candidate = obj as Record<string, unknown>;
  const data = candidate.data as Record<string, unknown> | undefined;
  if (!data || typeof data.name !== 'string') {
    return false;
  }

  if (typeof candidate.execute !== 'function') {
    return false;
  }

  return true;
}

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
