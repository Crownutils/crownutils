import type { CommandNode } from '../types.js';

export const setRank = {
  description: "Modifier le rang d'un utilisateur.",
  messages: {
    userOption: "L'utilisateur dont modifier le rang.",
    rankOption: 'Le rang à attribuer.',
    success: (user: string, rank: string) =>
      `${user} a désormais le rang ${rank}.`,
    alreadyThatRank: (user: string, rank: string) =>
      `${user} a déjà le rang ${rank}.`,
    cannotChangeSelf: 'Vous ne pouvez pas modifier votre propre rang.',
    cannotChangeOwner: 'Vous ne pouvez pas modifier le rang du propriétaire.',
  },
} satisfies CommandNode;
