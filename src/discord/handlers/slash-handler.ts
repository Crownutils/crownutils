import type { SlashCommand } from '../registries/index.js';
import { isSlashCommand } from '../registries/index.js';
import { loadModules } from './base-loader.js';

/** Loads every valid slash command module from `commands/slash/`. */
export async function loadSlashCommands(): Promise<SlashCommand[]> {
  return loadModules(
    new URL('../commands/slash/', import.meta.url),
    isSlashCommand,
  );
}
