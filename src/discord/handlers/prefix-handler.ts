import type { PrefixCommand } from '../registries/index.js';
import { isPrefixCommand } from '../registries/index.js';
import { loadModules } from './base-loader.js';

export async function loadPrefixCommands(): Promise<PrefixCommand[]> {
  const commands = await loadModules(
    new URL('../commands/prefix/', import.meta.url),
    isPrefixCommand,
  );

  return commands;
}
