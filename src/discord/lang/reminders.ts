import { md } from '@/discord/markdown.js';
import type { CommandLang } from './types.js';

export const reminders = {
  commandDescription: 'Affiche vos rappels en cours.',
  messages: {
    title: 'Vos rappels',
    empty: 'Aucun rappel en cours.',
    cannotDelete: 'Vous ne pouvez pas supprimer ce rappel.',
    item: ({ message, when }: { message: string; when: string }): string =>
      `${md.code(message)} — ${when}`,
  },
} as const satisfies CommandLang;
