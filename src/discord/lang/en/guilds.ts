import type { CommandNode } from '../types.js';

export const guilds = {
  description: 'List the servers the bot is in (owner only).',
  messages: {
    title: 'Servers',
    empty: 'The bot is not in any server.',
    summary: (guilds: string, members: string): string =>
      `Servers: ${guilds} | Members: ${members}`,
    joined: (date: string): string => `joined ${date}`,
    pageIndicator: (current: number, total: number): string =>
      `Page ${current}/${total}`,
    previous: 'Previous',
    next: 'Next',
  },
} as const satisfies CommandNode;
