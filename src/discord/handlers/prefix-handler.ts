import type { PrefixCommand } from '../registries/index.js';
import { isPrefixCommand } from '../registries/index.js';
import { loadModules } from './base-loader.js';

/** Loads every valid prefix command module from `commands/prefix/`. */
export async function loadPrefixCommands(): Promise<PrefixCommand[]> {
  return loadModules(
    new URL('../commands/prefix/', import.meta.url),
    isPrefixCommand,
  );
}
