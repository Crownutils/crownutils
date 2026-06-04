import type { SlashCommand } from '@/types/command.js';

/**
 * Shared registry of slash commands, keyed by command name.
 * Single source of truth: populated once at startup by the loader,
 * read by the interactionCreate event when routing commands.
 */
export const slashCommands = new Map<string, SlashCommand>();
