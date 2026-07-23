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
    perks: {
      title: 'Avantages',
      materials: `Catégorie Matériaux de ${md.code('crownicles-help')}`,
      upgrades: `Détail des améliorations d'équipement dans ${md.code('crownicles-help')}`,
      reminders: (limit: number, base: number) =>
        `${limit} rappels simultanés (au lieu de ${base})`,
      remindersUnlimited: 'Rappels illimités',
      maintenanceAccess: 'Utilisation du bot pendant la maintenance',
      administration: `Commandes d'administration (${md.code('maintenance')}, ${md.code('set-rank')})`,
    },
  },
} satisfies CommandNode;
