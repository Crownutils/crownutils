import type { SlashCommand } from '@/discord/types/command.js';

/** Slash commands, keyed by `data.name` and populated by `slash-handler.ts`. */
export const slashCommands = new Map<string, SlashCommand>();
