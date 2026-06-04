import type { SlashCommand } from '@/types/command.js';
import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { slashCommands } from '@/registries/slash-registry.js';
import { logger } from '@/lib/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
  const commandsPath = join(__dirname, '..', 'commands', 'slash');

  let files: string[];
  try {
    files = await readdir(commandsPath);
  } catch (error) {
    logger.error({ error }, 'Cannot read slash commands directory');
    return;
  }

  const commandFiles = files.filter(
    (file) =>
      (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts'),
  );

  for (const file of commandFiles) {
    const fileUrl = pathToFileURL(join(commandsPath, file)).href;
    const module = (await import(fileUrl)) as Record<string, unknown>;

    const candidate = module.command;
    if (!isSlashCommand(candidate)) {
      logger.warn(`${file} does not export a valid SlashCommand, skipping.`);
      continue;
    }

    slashCommands.set(candidate.data.name, candidate);
  }
}
