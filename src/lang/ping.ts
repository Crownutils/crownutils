export const ping = {
  description: 'Affiche la latence du bot.',
  messages: {
    title: '🏓 Pong',
    calculating: 'Calcul en cours...',
    result: ({
      totalMs,
      discordMs,
    }: {
      totalMs: number;
      discordMs: number;
    }): string => `Latence totale : ${totalMs} ms\nLatence Discord : ${discordMs} ms`,
  },
} as const;
