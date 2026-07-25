import type { Rank } from '@/core/types.js';

/** Named emoji used across presentations, so glyphs live in exactly one place. */
export const icons = {
  ping: '🏓',
  language: '🌐',
  success: '✅',
  error: '❌',
  warning: '⚠️',
  maintenance: '🛠️',
  scroll: '📜',
  shield: '🛡️',
  info: 'ℹ️',
  bell: '🔔',
  trash: '🗑️',
  relaunch: '🔄',
  users: '👥',
  guild: '🏰',
} as const;

/** Emote standing for each rank, used wherever a rank is shown next to a user. */
export const rankIcons = {
  banned: '⛔',
  normal: '👤',
  privileged: '🎟️',
  owner: '👑',
} as const satisfies Record<Rank, string>;
