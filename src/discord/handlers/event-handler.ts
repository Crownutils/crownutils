import type { ClientEvents } from 'discord.js';
import type { Event } from '@/discord/types/event.js';
import {
  hasFunction,
  hasString,
  isObject,
  loadModules,
} from './base-loader.js';

function isEvent(obj: unknown): obj is Event<keyof ClientEvents> {
  return isObject(obj) && hasString(obj, 'name') && hasFunction(obj, 'execute');
}

/** Loads all event modules from `src/discord/events/`. */
export async function loadEvents(): Promise<Event<keyof ClientEvents>[]> {
  return loadModules('events', 'event', isEvent);
}
