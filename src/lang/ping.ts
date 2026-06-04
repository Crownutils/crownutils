export const pingMessages = {
  title: '🏓 Pong',
  result: (totalMs: number, discordMs: number): string =>
    `Latence totale : ${totalMs} ms\nLatence Discord : ${discordMs} ms`,
} as const;
