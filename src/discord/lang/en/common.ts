import type { CommandScope } from '@/core/permissions/index.js';
import type { LangNode } from '../types.js';
import { md } from '@/discord/markdown.js';

/** Cross-cutting user-facing strings */
export const commonLang = {
  maintenance:
    'The bot is currently undergoing maintenance. Please try again in a few moments.',
  permissionDenied: 'You do not have permission to use this command.',
  unexpectedError:
    'An unexpected error has occurred. The incident has been logged.',
  gateDenied: 'You do not have access to this command at the moment.',
  interactionNotAllowed: 'You cannot interact with this message.',
  legalNotAccepted: `Please register (${md.code('register')}) with the bot before using it.`,
  scopeDenied: (scope: CommandScope): string => {
    switch (scope) {
      case 'guild':
        return 'This command can only be used on a server.';
      case 'dm':
        return 'This command can only be used in private messages.';
      case 'mainGuildOnly':
        return 'This command can only be used on the main server.';
      case 'anywhere':
        return 'This command cannot be used here.';
    }
  },
} as const satisfies LangNode;
