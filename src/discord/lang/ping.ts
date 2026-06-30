import { icons } from '@/discord/icons.js';
import type { CommandLang } from './types.js';

/** Strings for the `/ping` command. */
export const ping = {
  commandDescription: 'Affiche la latence du bot.',
  messages: {
    title: `${icons.pingPong} Pong`,
    calculating: 'Calcul en cours...',
    totalLatency: (latency: number) => `Latence totale : ${latency}`,
    discordLatency: (latency: number) => `Latence Discord : ${latency}`,
  },
} as const satisfies CommandLang;
