import type { CommandRegistries, PrefixCommand } from './types.js';

export * from './types.js';
export * from './guards.js';

/** Create empty in-memory command registries. */
export function createRegistries(): CommandRegistries {
  return { slash: new Map(), prefix: new Map() };
}

/** Resolve a prefix command by its name or one of its registered aliases. */
export function resolvePrefixCommand(
  registries: CommandRegistries,
  name: string,
): PrefixCommand | undefined {
  return registries.prefix.get(name);
}

/**
 * The client carries the registries so event handlers, which only receive the
 * gateway payload, can reach them via `interaction.client` / `message.client`.
 */
declare module 'discord.js' {
  interface Client {
    registries: CommandRegistries;
  }
}
