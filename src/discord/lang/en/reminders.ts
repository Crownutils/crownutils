import { md } from '@/discord/theme/markdown.js';
import type { CommandNode } from '../types.js';

export const reminders = {
  description: 'Show your active reminders.',
  messages: {
    title: 'Your reminders',
    empty: 'No active reminders.',
    cannotDelete: 'You cannot delete this reminder.',
    item: (message: string, when: string): string =>
      `${md.code(message)} - ${when}`,
  },
} as const satisfies CommandNode;
