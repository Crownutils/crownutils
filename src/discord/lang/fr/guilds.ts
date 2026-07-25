import type { CommandNode } from '../types.js';

export const guilds = {
  description:
    'Lister les serveurs sur lesquels le bot est présent (propriétaire uniquement).',
  messages: {
    title: 'Serveurs',
    empty: "Le bot n'est présent sur aucun serveur.",
    summary: (guilds: string, members: string): string =>
      `Serveurs : ${guilds} | Membres : ${members}`,
    joined: (date: string): string => `rejoint le ${date}`,
    pageIndicator: (current: number, total: number): string =>
      `Page ${current}/${total}`,
    previous: 'Précédent',
    next: 'Suivant',
  },
} as const satisfies CommandNode;
