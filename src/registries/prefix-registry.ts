import type { PrefixCommand } from '@/types/command.js';

/**
 * Shared registry of prefix commands, keyed by name AND aliases.
 * Multiple keys can point to the same command (an alias is just
 * another entry).
 */
export const prefixCommands = new Map<string, PrefixCommand>();
