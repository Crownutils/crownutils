import { icons } from '@/discord/theme/icons.js';
import type { CommandNode } from '../types.js';
import { formatNumber } from '../number.js';

export const ping = {
  description: 'Checks that the bot is responding and displays its latency.',
  messages: {
    calculating: 'Calculating...',
    title: `${icons.ping} Pong`,
    totalLatency: (latencyMs: number) =>
      `Total latency: ${formatNumber('en', latencyMs)}ms`,
    discordLatency: (latencyMs: number) =>
      `Discord latency: ${formatNumber('en', latencyMs)}ms`,
  },
} satisfies CommandNode;
