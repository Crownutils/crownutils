/** Emoji used across command presentations. */
export const icons = {
  pingPong: '🏓',
  bell: '🔔',
  trash: '🗑️',
  crown: '👑',
  ticket: '🎟️',
  worldMap: '🗺️',
  forward: '▶️',
  info: 'ℹ️',
  question: '❓',
  wrench: '🔧',
  mailbox: '📬',
  mailboxRead: '📭',
} as const satisfies Record<string, string>;
