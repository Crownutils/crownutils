import type { SlashCommand } from '../registries/index.js';
import { isSlashCommand } from '../registries/index.js';
import { loadModules } from './base-loader.js';

export async function loadSlashCommands(): Promise<SlashCommand[]> {
  const commands = await loadModules(
    new URL('../commands/slash/', import.meta.url),
    isSlashCommand,
  );

  return commands;
}
