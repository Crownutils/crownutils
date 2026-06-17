/**
 * Emojis specific to Crownicles help pages, kept separate from the generic UI
 * icons in `src/discord/icons.ts` and reusable across help pages.
 */
export const crowniclesIcons = {
  xp: '⭐',
  money: '💰',
  points: '🏅',
  attack: '🗡️',
  defense: '🛡️',
  speed: '🚀',
} as const satisfies Record<string, string>;

/** Rarity emote indexed by rarity level (0..8), matching the Crownicles set. */
export const RARITY_ICONS = [
  '🔸',
  '🔶',
  '🔥',
  '🔱',
  '☄️',
  '💫',
  '⭐',
  '🌟',
  '💎',
] as const;

/** Item nature emote indexed by nature id (0..7), matching the Crownicles set. */
export const NATURE_ICONS = [
  '❌',
  '❤️',
  '🚀',
  '⚔️',
  '🛡️',
  '🕥',
  '💰',
  '⚡',
] as const;

/** Emote shown next to each item category in the category select. */
export const CATEGORY_ICONS = {
  weapons: '⚔️',
  armors: '🛡️',
  objects: '🎒',
  potions: '🧪',
} as const satisfies Record<string, string>;
