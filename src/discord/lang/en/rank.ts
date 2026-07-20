import { md } from '@/discord/theme/markdown.js';
import type { CommandNode } from '../types.js';

export const rank = {
  description: 'Displays your permission level on the bot.',
  messages: {
    explanation:
      'Your rank determines your permission level on the bot; this determines access to certain commands and various additional features.',
    userRank: (rank: string, rankIcon: string) =>
      `${md.bold('Current rank:')} ${rank} ${rankIcon}`,
    rankLevel: (rankLevel: number) =>
      `${md.bold('Permission level:')} ${rankLevel}`,
  },
} satisfies CommandNode;
