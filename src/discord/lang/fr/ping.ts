import { icons } from '@/discord/icons.js';
import type { CommandNode } from '../types.js';

export const ping = {
  description: 'Vérifie que le bot répond et affiche sa latence.',
  messages: {
    calculating: 'Calcul en cours...',
    title: `${icons.ping} Pong`,
    totalLatency: (latencyMs: number) => `Latence totale : ${latencyMs}ms`,
    discordLatency: (latencyMs: number) => `Latence Discord : ${latencyMs}ms`,
  },
} satisfies CommandNode;
