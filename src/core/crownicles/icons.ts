/**
 * Crownicles-specific emotes, persisted here rather than fetched: the outcome
 * and effect sets are small and stable, so vendoring them keeps event pages
 * rendering without an extra network round-trip. The numerous item/location
 * emotes stay fetched from the game's icon source when a page needs them.
 */

import type { ItemCategory } from './item-constants.js';

/**
 * Emotes for the reward/penalty fields of a possibility outcome. `money` and
 * `health` have a distinct emote for a loss, matching the game's own display.
 */
export const outcomeIcons = {
  xp: '⭐',
  points: '🏅',
  money: '💰',
  moneyLoss: '💸',
  health: '❤️',
  healthLoss: '💔',
  energy: '⚡',
  gems: '💎',
  tokens: '🪙',
  time: '🕑',
  item: '🎁',
  pet: '🐾',
  oneshot: '💀',
  travel: '🧭',
  nextEvent: '🔗',
} as const satisfies Record<string, string>;

/** An alteration an outcome can apply: its emote and how long it lasts. */
export interface EffectInfo {
  readonly icon: string;
  /** Base duration in minutes; `0` means instant or, for `occupied`, variable (the outcome's `lostTime`). */
  readonly durationMinutes: number;
}

/**
 * Alteration `effect` id -> emote and base duration, mirroring the game's
 * `Effect` table. `none` is intentionally absent: "no effect" renders nothing.
 * `occupied` lasts the outcome's `lostTime`, so its base duration is `0` here.
 */
export const effects: Record<string, EffectInfo> = {
  notStarted: { icon: '👶', durationMinutes: 0 },
  // The game's "until revived" sentinel (~32 years), kept verbatim.
  dead: { icon: '💀', durationMinutes: 16666667 },
  sleeping: { icon: '😴', durationMinutes: 180 },
  drunk: { icon: '🥴', durationMinutes: 240 },
  freezing: { icon: '🥶', durationMinutes: 60 },
  feetHurt: { icon: '🦶', durationMinutes: 110 },
  hurt: { icon: '🤕', durationMinutes: 300 },
  sick: { icon: '🤢', durationMinutes: 330 },
  jailed: { icon: '🔒', durationMinutes: 1440 },
  injured: { icon: '😵', durationMinutes: 660 },
  occupied: { icon: '🕑', durationMinutes: 0 },
  starving: { icon: '🤤', durationMinutes: 50 },
  confounded: { icon: '😖', durationMinutes: 40 },
  scared: { icon: '😱', durationMinutes: 15 },
  lost: { icon: '🧐', durationMinutes: 270 },
  fished: { icon: '🐟', durationMinutes: 5 },
};

/**
 * Emote per item category, in the game's `ItemCategory` order. Vendored from
 * the `itemKinds` table of `CrowniclesIcons.ts`.
 */
export const itemCategoryIcons = {
  weapons: '⚔️',
  armors: '🛡️',
  potions: '⚗️',
  objects: '🧸',
} as const satisfies Record<ItemCategory, string>;

/** Emote per item rarity (`0` basic .. `8` mythical), vendored from the `rarity` table. */
export const itemRarityIcons: readonly string[] = [
  '🔸',
  '🔶',
  '🔥',
  '🔱',
  '☄️',
  '💫',
  '⭐',
  '🌟',
  '💎',
];

/** Emote per `ItemNature` id (`0` none .. `7` energy), vendored from the `itemNatures` table. */
export const itemNatureIcons: readonly string[] = [
  '❌',
  '❤️',
  '🚀',
  '🗡️',
  '🛡️',
  '🕥',
  '💰',
  '⚡',
];

/** Emotes of the displayed item stats, vendored from the `unitValues` table. */
export const itemStatIcons = {
  attack: '🗡️',
  defense: '🛡️',
  speed: '🚀',
} as const;

/**
 * Emote per location `type` code, for the location select. The full `mapTypes`
 * table vendored from the game's `CrowniclesIcons.ts`; unknown (newly added)
 * types fall back to no emote until this list is refreshed.
 */
export const locationTypeIcons: Record<string, string> = {
  abyss: '🕳️',
  be: '🏖️',
  castleEntrance: '🏰',
  castleThrone: '🪑',
  cavern: '🪨',
  ci: '🏘️',
  continent: '🏞️',
  creek: '🌅',
  crystalCavern: '💎',
  de: '🏜️',
  fo: '🌳',
  iceBeach: '🌨️',
  la: '🚣',
  mine: '🪨',
  mo: '⛰️',
  pl: '🌺',
  pveExit: '⛴️',
  ri: '🏞️',
  ro: '🛣️',
  ruins: '🏚️',
  testZone: '👾',
  tundra: '🌲',
  vi: '🛖',
  volcano: '🌋',
  icePeak: '🏔️',
  blessedDoors: '⛩️',
  undergroundLake: '💧',
  dragonsNest: '🪹',
  mistyPath: '🌫️',
  hauntedHouse: '🏚️',
};
