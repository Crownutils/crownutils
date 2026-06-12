import { icons } from '@/discord/icons.js';
import type { CommandLang } from './types.js';

export const ping = {
  commandDescription: 'Affiche la latence du bot.',
  messages: {
    title: `${icons.pingPong} Pong`,
    calculating: 'Calcul en cours...',
    result: ({
      totalMs,
      discordMs,
    }: {
      totalMs: number;
      discordMs: number;
    }): string =>
      `Latence totale : ${totalMs} ms\nLatence Discord : ${discordMs} ms`,
  },
} as const satisfies CommandLang;
