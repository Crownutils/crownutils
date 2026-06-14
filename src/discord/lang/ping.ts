import { icons } from '@/discord/icons.js';
import type { CommandLang } from './types.js';

/** Strings for the `/ping` command. */
export const ping = {
  commandDescription: 'Affiche la latence du bot.',
  messages: {
    title: `${icons.pingPong} Pong`,
    calculating: 'Calcul en cours...',
    totalLatence: (latence: number) => `Latence total : ${latence}`,
    discordLatence: (latence: number) => `Latence Discord : ${latence}`,
  },
} as const satisfies CommandLang;
