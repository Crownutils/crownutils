export const reminder = {
  description: 'Définir un rappel.',
  listDescription: 'Affiche vos rappels en cours.',
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
        `Votre rappel pour \`${message}\` a été défini pour : ${when}.`,
    },
    cancelled: {
      title: 'Rappel annulé',
      description: ({ message }: { message: string }): string =>
        `Votre rappel pour \`${message}\` a été annulé.`,
    },
    triggeredTitle: '🔔 DRING !',
    durationTooLong: 'Un rappel ne peut pas dépasser 24 jours.',
    limitReached: ({ max }: { max: number }): string =>
      `Vous avez atteint la limite de ${max} rappels simultanés.`,
    list: {
      title: 'Vos rappels',
      empty: 'Aucun rappel en cours.',
      cannotDelete: 'Vous ne pouvez pas supprimer ce rappel.',
      notAuthor: 'Ce bouton est réservé à la personne qui a lancé la commande.',
      item: ({ message, when }: { message: string; when: string }): string =>
        `\`${message}\` — ${when}`,
    },
    invalidFormat: {
      prefix: 'Format invalide. Exemples : `!r`, `!r 1h30m faire les courses`',
      slash:
        'Format invalide. Exemples : `/remind`, `/remind time:1h30m message:faire les courses`',
    },
  },
} as const;
