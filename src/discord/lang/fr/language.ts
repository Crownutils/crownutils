import { icons } from '@/discord/icons.js';
import type { CommandNode } from '../types.js';

export const language = {
  description: 'Changez la langue dans laquelle le bot vous répond.',
  messages: {
    title: `${icons.language} Langue`,
    prompt: 'Sélectionnez la langue que le bot doit utiliser avec vous.',
    placeholder: 'Choisissez une langue',
  },
} satisfies CommandNode;
