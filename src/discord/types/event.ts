import type { ClientEvents } from 'discord.js';

/** A discord.js client event handler module, loaded by `event-handler.ts`. */
export interface Event<K extends keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute(...args: ClientEvents[K]): Promise<void> | void;
}
