import type { CommandNode } from '../types.js';

export const users = {
  description: 'List the users known to the bot (owner only).',
  messages: {
    title: 'Registered users',
    empty: 'No user is stored yet.',
    total: (count: string): string => `Total: ${count}`,
    notRegistered: 'not registered',
    truncated: (shown: string): string =>
      `Only the first ${shown} users are listed.`,
    pageIndicator: (current: number, total: number): string =>
      `Page ${current}/${total}`,
    previous: 'Previous',
    next: 'Next',
  },
} as const satisfies CommandNode;
