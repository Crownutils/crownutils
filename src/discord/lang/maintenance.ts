import { icons } from '@/discord/icons.js';
import type { CommandLang } from './types.js';

/** Strings for the `/maintenance` command. */
export const maintenance = {
  commandDescription:
    'Active ou désactive le mode maintenance (réservé au propriétaire).',
  messages: {
    enabled: `${icons.wrench} Mode maintenance activé. Seul le propriétaire peut utiliser le bot.`,
    disabled: `${icons.wrench} Mode maintenance désactivé. Le bot est de nouveau accessible à tous.`,
  },
} as const satisfies CommandLang;
