import { icons } from '@/discord/theme/icons.js';
import type { CommandNode } from '../types.js';
import { formatNumber } from '../number.js';

export const ping = {
  description: 'Vérifie que le bot répond et affiche sa latence.',
  messages: {
    calculating: 'Calcul en cours...',
    title: `${icons.ping} Pong`,
    totalLatency: (latencyMs: number) =>
      `Latence totale : ${formatNumber('fr', latencyMs)}ms`,
    discordLatency: (latencyMs: number) =>
      `Latence Discord : ${formatNumber('fr', latencyMs)}ms`,
  },
} satisfies CommandNode;
