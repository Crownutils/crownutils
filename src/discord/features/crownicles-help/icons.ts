import type { RecipeOutputType } from '@/core/crownicles/index.js';
import type { RecipesSection } from './page.js';

/**
 * Every glyph the help center picks for itself, gathered here so no page
 * declares one inline. Each table is keyed exactly like the lang node holding
 * the matching labels, so a value's emote and its wording are looked up with the
 * same key.
 *
 * The emotes that belong to the game rather than to us -- outcome, effect, item
 * and location-type tables -- stay in `@/core/crownicles/icons.js`, where the
 * project NOTICE scopes them.
 */

/** Emote of each help page, keyed like its node under the crownicles-help `messages`. */
export const pageIcons = {
  home: '🏠',
  events: '🎭',
  special: '✨',
  materials: '⛏️',
  recipes: '🍳',
  equipment: '⚔️',
  level: '⭐',
  rage: '🤬',
  witch: '🧹',
  leagues: '🏆',
  route: '🗺️',
  missions: '📜',
} as const;

/** Emote per material type; keys mirror the `materials.types` lang node. */
export const materialTypeIcons: Record<string, string> = {
  metal: '⚙️',
  alloy: '🔩',
  nature: '🌿',
  spiritual: '🔮',
  magic: '✨',
  leather: '🟫',
  rope: '🪢',
  poison: '☠️',
  explosive: '🧨',
  wood: '🪵',
};

/** Emote per material rarity level (`1`..`3`); index `0` is unused. */
export const materialRarityIcons: readonly string[] = ['', '🟢', '🔵', '🟣'];

/** Emote per material source line of the "how to obtain" section. */
export const materialSourceIcons = {
  smallEvent: '🔎',
  expedition: '🧭',
  boss: '👹',
  compost: '♻️',
  cooking: '🍳',
} as const;

/**
 * Emote per section of the recipes page; keys mirror the `recipes.sections`
 * lang node. Keyed by the closed union rather than by `string`, so every
 * section is required here and a lookup never comes back empty.
 */
export const recipeSectionIcons: Record<RecipesSection, string> = {
  browse: '📖',
  xp: '⭐',
  failure: '🎲',
};

/** Emote per recipe output category; keys mirror the `recipes.categories` lang node. */
export const recipeCategoryIcons: Record<RecipeOutputType, string> = {
  material: '🧱',
  potion: '⚗️',
  petFood: '🦴',
};

/**
 * Emote per way of learning a recipe; keys mirror the
 * `recipes.discoverySources` lang node and the game's `RecipeDiscoverySource`.
 */
export const recipeDiscoveryIcons: Record<string, string> = {
  DEFAULT: '📖',
  WITCH: '🧹',
  FARMER: '🧑‍🌾',
  GASPARD_JO: '🧑‍🍳',
  ISLAND_BOSS: '👹',
  COOKING_LEVEL: '🍳',
  PLAYER_LEVEL_MILESTONE: '⭐',
  CAMPAIGN_MILESTONE: '📜',
};

/** Emote per fact line of a recipe detail; keys mirror the `recipes` lang node. */
export const recipeFactIcons = {
  level: '📈',
  grade: '🎓',
  unlock: '🔓',
  lovePoints: '💗',
  plants: '🌱',
  materials: '⛏️',
} as const;

/** Emote per expedition terrain; keys mirror the `materials.terrains` lang node. */
export const expeditionIcons: Record<string, string> = {
  forest: '🌲',
  mountain: '⛰️',
  desert: '🏜️',
  swamp: '🌿',
  ruins: '🏛️',
  cave: '🕳️',
  plains: '🌾',
  coast: '🌊',
};

/** The remaining one-off glyphs the help center renders inline. */
export const helpIcons = {
  /** Stand-in for the auto-resolved `end` choice, which has no reaction icon. */
  endChoice: '🔚',
  /** Usage count of a fight potion. */
  usages: '🔁',
} as const;
