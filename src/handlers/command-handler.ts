import type { SlashCommand } from '@/types/command.js';
import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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

export async function loadSlashCommands(): Promise<Map<string, SlashCommand>> {
  const commands = new Map<string, SlashCommand>();
  const commandsPath = join(__dirname, '..', 'commands', 'slash');

  const files = await readdir(commandsPath);
  const commandFiles = files.filter(
    (file) =>
      (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts'),
  );

  for (const file of commandFiles) {
    const fileUrl = pathToFileURL(join(commandsPath, file)).href;
    const module = (await import(fileUrl)) as Record<string, unknown>;

    const candidate = module.command;
    if (!isSlashCommand(candidate)) {
      console.warn(
        `⚠️ ${file} does not export a valid SlashCommand, skipping.`,
      );
      continue;
    }

    commands.set(candidate.data.name, candidate);
  }

  return commands;
}
