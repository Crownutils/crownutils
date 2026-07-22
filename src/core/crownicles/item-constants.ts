/**
 * Item balance constants vendored from the Crownicles source (values are
 * stable; update here if the game rebalances them). Sources:
 * `Lib/src/constants/ItemConstants.ts`, `Lib/src/constants/InventoryConstants.ts`,
 * `Lib/src/constants/ItemMaterialCategoryConstants.ts` and the stat formulas of
 * `Core/src/data/Weapon.ts` / `Core/src/data/Armor.ts`.
 */

/** The four item categories, in the game's `ItemCategory` enum order. */
export const ITEM_CATEGORIES = [
  'weapons',
  'armors',
  'potions',
  'objects',
] as const;

/** One of the {@link ITEM_CATEGORIES}. */
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

/** Number of item rarities (`ItemRarity` 0 Basic .. 8 Mythical). */
export const ITEM_RARITY_COUNT = 9;

/** Item value per rarity, indexed by rarity (`ItemConstants.RARITY.VALUES`). */
export const RARITY_VALUES = [
  0, 20, 40, 100, 250, 580, 1690, 5000, 10000,
] as const;

/**
 * Per-rarity multiplier feeding the main-stat formula, indexed by rarity
 * (`InventoryConstants.ITEMS_MAPPER`).
 */
export const RARITY_MULTIPLIER = [
  1, 1.5, 2.1, 2.8, 3.6, 4.5, 5.5, 6.6, 6.7,
] as const;

/**
 * Coefficients of the exponential main-stat formula shared by
 * `Weapon.getBaseAttack` and `Armor.getBaseDefense`:
 * `round(SCALE * m^RARITY_EXPONENT * (GROWTH_BASE + GROWTH_BONUS / m)^raw)`
 * with `m` the item's {@link RARITY_MULTIPLIER}.
 */
export const MAIN_STAT_FORMULA = {
  SCALE: 1.15053,
  RARITY_EXPONENT: 2.3617,
  GROWTH_BASE: 1.0569,
  GROWTH_BONUS: 0.1448,
} as const;

/** Stat multiplier per upgrade level, indexed by level (`0`..`5`). */
export const UPGRADE_LEVEL_STATS_MULTIPLIER = [
  1, 1.05, 1.1, 1.16, 1.23, 1.32,
] as const;

/** Highest upgrade level an item can reach. */
export const MAX_UPGRADE_LEVEL = 5;

/** Number of blacksmith material pools (`ITEM_MATERIAL_CATEGORY_COUNT`, ids `1`..`15`). */
export const ITEM_MATERIAL_CATEGORY_COUNT = 15;

/**
 * Total material quantity consumed by an upgrade, as
 * `[common, uncommon, rare]` triples indexed `[itemRarity][level - 1]`
 * (`ItemConstants.UPGRADE_MATERIALS_PER_ITEM_RARITY_AND_LEVEL`). Basic items
 * (rarity `0`) consume nothing and cannot be upgraded.
 */
export const UPGRADE_MATERIAL_TOTALS: readonly (readonly (readonly [
  number,
  number,
  number,
])[])[] = [
  [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  [
    [2, 0, 0],
    [3, 0, 0],
    [4, 0, 0],
    [5, 0, 0],
    [6, 0, 0],
  ],
  [
    [2, 0, 0],
    [4, 0, 0],
    [5, 1, 0],
    [6, 2, 0],
    [6, 4, 0],
  ],
  [
    [3, 0, 0],
    [4, 1, 0],
    [5, 3, 0],
    [6, 5, 0],
    [8, 5, 1],
  ],
  [
    [5, 0, 0],
    [6, 2, 0],
    [7, 3, 1],
    [8, 4, 2],
    [9, 5, 3],
  ],
  [
    [8, 2, 0],
    [9, 4, 1],
    [10, 5, 2],
    [11, 6, 3],
    [12, 7, 5],
  ],
  [
    [6, 2, 2],
    [12, 6, 3],
    [12, 6, 6],
    [16, 9, 6],
    [20, 12, 8],
  ],
  [
    [18, 6, 3],
    [21, 14, 8],
    [32, 16, 10],
    [36, 27, 15],
    [40, 30, 18],
  ],
  [
    [24, 16, 5],
    [36, 18, 12],
    [40, 30, 14],
    [44, 30, 24],
    [48, 33, 24],
  ],
];

/**
 * `ItemNature` ids that make a potion a fight potion (speed, attack, defense).
 * The full enum is `NONE, HEALTH, SPEED, ATTACK, DEFENSE, TIME_SPEEDUP, MONEY,
 * ENERGY` (ids `0`..`7`), matching the `nature` field of potions and objects.
 */
export const FIGHT_ITEM_NATURES: readonly number[] = [2, 3, 4];
