export const reminderMessages = {
  created: {
    title: 'Rappel défini',
    description: (message: string, date: Date) =>
      `Votre rappel pour \`${message}\` a été défini pour : <t:${date.getTime()}:R>.`,
  },
  triggered: {
    title: '🔔 DRING !',
  },
} as const;
