export const reminder = {
  description: 'Définir un rappel.',
  options: {
    time: 'La durée avant le rappel. Ex : 1h30m, 30s.',
    message: 'Le message du rappel.',
  },
  messages: {
    defaultMessage: 'Vous pouvez effectuer votre rapport.',
    created: {
      title: 'Rappel défini',
      description: ({ message, when }: { message: string; when: string }): string =>
        `Votre rappel pour \`${message}\` a été défini pour : ${when}.`,
    },
    triggeredTitle: '🔔 DRING !',
    durationTooLong: 'Un rappel ne peut pas dépasser 24 jours.',
    invalidFormat: {
      prefix: 'Format invalide. Exemples : `!r`, `!r 1h30m faire les courses`',
      slash:
        'Format invalide. Exemples : `/remind`, `/remind time:1h30m message:faire les courses`',
    },
  },
} as const;
