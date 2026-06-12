import { md } from '@/discord/markdown.js';
import type { CommandLang } from './types.js';

export const grade = {
  commandDescription: 'Affiche votre niveau de permission sur le bot.',
  messages: {
    explication:
      "Votre grade détermine votre niveau de permission sur le bot, celui-ci détermine l'accès à certaines commandes et l'accès à diverses fonctionnalités supplémentaires.",
    userGrade: (userGrade: string, gradeIcon: string) =>
      `${md.bold('Grade actuel :')} ${userGrade} ${gradeIcon}`,
    gradeRank: (gradeRank: number) =>
      `${md.bold('Niveau de permission :')} ${gradeRank}`,
  },
} as const satisfies CommandLang;
