import type { CommandNode } from '../types.js';

export const setRank = {
  description: 'Change the rank of a user.',
  messages: {
    userOption: 'The user whose rank to change.',
    rankOption: 'The rank to assign.',
    success: (user: string, rank: string) =>
      `${user} now has the rank ${rank}.`,
    alreadyThatRank: (user: string, rank: string) =>
      `${user} already has the rank ${rank}.`,
    cannotChangeSelf: 'You cannot change your own rank.',
    cannotChangeOwner: 'You cannot change the rank of the owner.',
  },
} satisfies CommandNode;
