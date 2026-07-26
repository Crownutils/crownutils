import type { Rank } from '@/core/types.js';

/**
 * Joins a glyph to the text it decorates -- the single rule for that spacing,
 * shared by {@link Text.icon} and by the call sites that assemble a value
 * inline. An absent or empty glyph yields `text` untouched, so an optional game
 * emote needs no guard at the call site.
 */
export function withIcon(
  glyph: string | undefined,
  text: string | number,
): string {
  return glyph === undefined || glyph === ''
    ? String(text)
    : `${glyph} ${String(text)}`;
}

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
