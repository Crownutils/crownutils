import { icons } from '@/discord/theme/icons.js';
import type { CommandNode } from '../types.js';

export const register = {
  description: "S'enregistrer sur le bot afin d'accéder aux fonctionnalités.",
  messages: {
    acceptButtonLabel: 'Accepter',
    declineButtonLabel: 'Refuser',
    doneTitle: `${icons.success} Inscription terminée`,
    doneBody:
      'Vous avez accepté les documents et avez désormais accès à toutes les fonctionnalités du bot.',
    cancelledTitle: `${icons.error} Inscription annulée`,
    cancelledBody:
      'Vous avez refusé les documents. Vous pourrez vous inscrire à nouveau à tout moment.',
    alreadyTitle: `${icons.success} Déjà inscrit`,
    alreadyBody: (version: string, date: string) =>
      `Vous avez déjà accepté les documents (version ${version}) le ${date}.`,
    cannotRegister:
      'Vous avez été banni de manière permanente, vous ne pouvez pas vous enregister sur le bot.',
  },
} satisfies CommandNode;
