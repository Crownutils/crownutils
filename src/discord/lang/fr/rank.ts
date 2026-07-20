import { md } from '@/discord/theme/markdown.js';
import type { CommandNode } from '../types.js';

export const rank = {
  description: 'Affiche votre niveau de permission sur le bot.',
  messages: {
    explanation:
      "Votre grade détermine votre niveau de permission sur le bot, celui-ci détermine l'accès à certaines commandes et l'accès à diverses fonctionnalités supplémentaires.",
    userRank: (rank: string, rankIcon: string) =>
      `${md.bold('Grade actuel :')} ${rank} ${rankIcon}`,
    rankLevel: (rankLevel: number) =>
      `${md.bold('Niveau de permission :')} ${rankLevel}`,
  },
} satisfies CommandNode;
