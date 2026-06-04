export const pingMessages = {
  calculating: '🏓 Pong',
  result: (totalMs: number, discordMs: number): string =>
    `🏓 Pong\nLatence totale : ${totalMs} ms\nLatence Discord : ${discordMs} ms`,
} as const;
