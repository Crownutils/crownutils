import { icons } from '@/discord/icons.js';
import type { CommandNode } from '../types.js';

export const language = {
  description: 'Change the language the bot replies to you in.',
  messages: {
    title: `${icons.language} Language`,
    prompt: 'Select the language you want the bot to use with you.',
    placeholder: 'Choose a language',
  },
} satisfies CommandNode;
