import { icons } from '@/discord/icons.js';
import type { CommandNode } from '../types.js';

export const ping = {
  description: 'Checks that the bot is responding and displays its latency.',
  messages: {
    calculating: 'Calculating...',
    title: `${icons.ping} Pong`,
    totalLatency: (latencyMs: number) => `Total latency: ${latencyMs}ms`,
    discordLatency: (latencyMs: number) => `Discord latency: ${latencyMs}ms`,
  },
} satisfies CommandNode;
