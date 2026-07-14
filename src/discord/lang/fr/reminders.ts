import { md } from '@/discord/theme/markdown.js';
import type { CommandNode } from '../types.js';

export const reminders = {
  description: 'Afficher vos rappels en cours.',
  messages: {
    title: 'Vos rappels',
    empty: 'Aucun rappel en cours.',
    cannotDelete: 'Vous ne pouvez pas supprimer ce rappel.',
    item: (message: string, when: string): string =>
      `${md.code(message)} - ${when}`,
  },
} as const satisfies CommandNode;
