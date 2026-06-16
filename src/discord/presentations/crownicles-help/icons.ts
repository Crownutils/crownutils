/**
 * Emojis specific to Crownicles help pages, kept separate from the generic UI
 * icons in `src/discord/icons.ts` and reusable across help pages.
 */
export const crowniclesIcons = {
  xp: '⭐',
  money: '💰',
  points: '🏅',
} as const satisfies Record<string, string>;
