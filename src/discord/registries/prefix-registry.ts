import type { PrefixCommand } from '@/discord/types/command.js';

/**
 * Prefix commands, populated by `prefix-handler.ts`. Each command is
 * registered once under its `name` and once per entry in `aliases`
 * (same object reference) — deduplicate with `new Set(...)` before
 * iterating if you need each command only once.
 */
export const prefixCommands = new Map<string, PrefixCommand>();
