import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { ClientEvents } from 'discord.js';
import type { Event } from '@/types/event.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Type guard ensuring a dynamically imported value is a usable Event
 * (has a string name and a callable execute).
 */
function isEvent(obj: unknown): obj is Event<keyof ClientEvents> {
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

export async function loadEvents(): Promise<Event<keyof ClientEvents>[]> {
  const events: Event<keyof ClientEvents>[] = [];
  const eventsPath = join(__dirname, '..', 'events');

  let files: string[];
  try {
    files = await readdir(eventsPath);
  } catch (error) {
    console.error('Cannot read events directory:', error);
    return events;
  }

  const eventFiles = files.filter(
    (file) =>
      (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts'),
  );

  for (const file of eventFiles) {
    const fileUrl = pathToFileURL(join(eventsPath, file)).href;
    const module = (await import(fileUrl)) as Record<string, unknown>;
    const candidate = module.event;

    if (!isEvent(candidate)) {
      console.warn(`⚠️  ${file} does not export a valid Event, skipping.`);
      continue;
    }

    events.push(candidate);
  }

  return events;
}
