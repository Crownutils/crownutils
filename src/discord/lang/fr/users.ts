import type { CommandNode } from '../types.js';

export const users = {
  description:
    'Lister les utilisateurs connus du bot (propriétaire uniquement).',
  messages: {
    title: 'Utilisateurs enregistrés',
    empty: 'Aucun utilisateur enregistré pour le moment.',
    total: (count: string): string => `Total : ${count}`,
    notRegistered: 'non enregistré',
    truncated: (shown: string): string =>
      `Seuls les ${shown} premiers utilisateurs sont affichés.`,
    pageIndicator: (current: number, total: number): string =>
      `Page ${current}/${total}`,
    previous: 'Précédent',
    next: 'Suivant',
  },
} as const satisfies CommandNode;
