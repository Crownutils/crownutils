import type { SlashCommand } from '@/types/command.js';
import { slashCommands } from '@/registries/slash-registry.js';
import { loadModules } from './base-loader.js';

/**
 * Type guard that checks whether a dynamically imported object is a
 * usable SlashCommand (has a `data.name` and a callable `execute`).
 * Lets the loader skip malformed files at startup instead of crashing
 * later at runtime.
 */
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
