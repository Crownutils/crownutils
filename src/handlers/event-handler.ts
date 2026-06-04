import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { ClientEvents } from 'discord.js';
import type { Event } from '@/types/event.js';
import { loadModules } from './base-loader.js';

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
  return loadModules('events', 'event', isEvent);
}
