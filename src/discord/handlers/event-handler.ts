import type { ClientEvents } from 'discord.js';
import type { EventModule } from '../registries/types.js';
import { loadModules } from './base-loader.js';
import { isEventModule } from '../registries/index.js';

/** Loads every valid gateway event module from `events/`; the client binds them at init. */
export async function loadEvents(): Promise<EventModule<keyof ClientEvents>[]> {
  return loadModules(new URL('../events/', import.meta.url), isEventModule);
}
