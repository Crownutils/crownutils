import type { ClientEvents } from 'discord.js';
import type { EventModule } from '../registries/types.js';
import { loadModules } from './base-loader.js';
import { isEventModule } from '../registries/index.js';

/** Discover event modules and bind each one to the client. */
export async function loadEvents(): Promise<EventModule<keyof ClientEvents>[]> {
  const events = await loadModules(
    new URL('../events/', import.meta.url),
    isEventModule,
  );

  return events;
}
