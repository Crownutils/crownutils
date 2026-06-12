import { icons } from '@/lib/icons.js';
import { md } from '@/lib/markdown.js';

export const reminder = {
  commandDescription: 'Définir un rappel.',
  commandListDescription: 'Affiche vos rappels en cours.',
  options: {
    time: 'La durée avant le rappel. Ex : 1h30m, 30s.',
    message: 'Le message du rappel.',
  },
  messages: {
    defaultMessage: 'Vous pouvez effectuer votre rapport.',
    created: {
      title: 'Rappel défini',
      cancelButton: 'Annuler ce rappel',
      description: ({
        message,
        when,
      }: {
        message: string;
        when: string;
      }): string =>
        `Votre rappel pour ${md.code(message)} a été défini pour : ${when}.`,
    },
    cancelled: {
      title: 'Rappel annulé',
      description: ({ message }: { message: string }): string =>
        `Votre rappel pour ${md.code(message)} a été annulé.`,
    },
    triggeredTitle: `${icons.bell} DRING !`,
    durationTooLong: 'Un rappel ne peut pas dépasser 24 jours.',
    limitReached: ({ max }: { max: number }): string =>
      `Vous avez atteint la limite de ${max} rappels simultanés.`,
    list: {
      title: 'Vos rappels',
      empty: 'Aucun rappel en cours.',
      cannotDelete: 'Vous ne pouvez pas supprimer ce rappel.',
      item: ({ message, when }: { message: string; when: string }): string =>
        `${md.code(message)} — ${when}`,
    },
    invalidFormat: {
      prefix: `Format invalide. Exemples : ${md.code('!r')}, ${md.code('!r 1h30m faire les courses')}`,
      slash: `Format invalide. Exemples : ${md.code('/remind')}, ${md.code('/remind time:1h30m message:faire les courses')}`,
    },
  },
} as const;
