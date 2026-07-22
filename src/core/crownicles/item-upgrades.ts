import { cacheShared } from './cache.js';
import {
  ITEM_MATERIAL_CATEGORY_COUNT,
  ITEM_RARITY_COUNT,
  MAIN_STAT_FORMULA,
  MAX_UPGRADE_LEVEL,
  RARITY_MULTIPLIER,
  RARITY_VALUES,
  UPGRADE_LEVEL_STATS_MULTIPLIER,
  UPGRADE_MATERIAL_TOTALS,
} from './item-constants.js';
import {
  fetchCrowniclesJson,
  HTTP_CONCURRENCY,
  mapWithConcurrency,
} from './source.js';

/**
 * Distinct-material counts of one item rarity, from
 * `Core/resources/itemUpgradeMaterialCounts/<itemRarity>.json`. `levels` is
 * indexed by `upgradeLevel - 1`; each entry caps how many different materials
 * of that rarity one upgrade uses.
 */
export interface ItemUpgradeDistinctCounts {
  readonly levels: readonly {
    readonly common: number;
    readonly uncommon: number;
    readonly rare: number;
  }[];
}

/**
 * Blacksmith material pool of one item material category, from
 * `Core/resources/itemMaterialCategories/<id>.json` (7 common + 7 uncommon +
 * 6 rare material ids).
 */
export interface ItemMaterialPool {
  readonly common: readonly number[];
  readonly uncommon: readonly number[];
  readonly rare: readonly number[];
}

/** Distinct-material counts indexed by item rarity (`0`..`8`), cached. */
export const getUpgradeDistinctCounts = cacheShared(() => {
  const rarities = Array.from(
    { length: ITEM_RARITY_COUNT },
    (_, index) => index,
  );
  return mapWithConcurrency(rarities, HTTP_CONCURRENCY, (rarity) =>
    fetchCrowniclesJson<ItemUpgradeDistinctCounts>(
      `Core/resources/itemUpgradeMaterialCounts/${rarity}.json`,
    ),
  );
});

/** Blacksmith material pools keyed by category id (`1`..`15`), cached. */
export const getItemMaterialPools = cacheShared(async () => {
  const ids = Array.from(
    { length: ITEM_MATERIAL_CATEGORY_COUNT },
    (_, index) => index + 1,
  );
  const pools = await mapWithConcurrency(ids, HTTP_CONCURRENCY, async (id) => ({
    id,
    pool: await fetchCrowniclesJson<ItemMaterialPool>(
      `Core/resources/itemMaterialCategories/${id}.json`,
    ),
  }));
  return new Map<number, ItemMaterialPool>(
    pools.map(({ id, pool }) => [id, pool]),
  );
});

/**
 * The game's seeded Fisher-Yates shuffle (`RandomUtils.deterministicShuffle`),
 * reproduced verbatim (including the uint32 LCG overflow behavior) so material
 * picks match the blacksmith exactly.
 */
function deterministicShuffle(
  array: readonly number[],
  seed: number,
): number[] {
  const result = [...array];
  let state = seed >>> 0;
  if (state === 0) state = 1;
  for (let i = result.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) >>> 0;
    const j = state % (i + 1);
    const a = result[i];
    const b = result[j];
    if (a !== undefined && b !== undefined) {
      result[i] = b;
      result[j] = a;
    }
  }
  return result;
}

/** The game's item-id seed multiplier (`POOL_SEED_ITEM_ID_MULTIPLIER`). */
const POOL_SEED_ITEM_ID_MULTIPLIER = 31;

/**
 * The game's deterministic material pick (`pickDistinctMaterials`): a seeded
 * permutation of the sub-pool read through a window that slides one slot per
 * upgrade level, so consecutive levels change at most one material.
 */
function pickDistinctMaterials(
  subPool: readonly number[],
  itemId: number,
  materialRarity: number,
  level: number,
  distinctCount: number,
): number[] {
  if (distinctCount <= 0 || subPool.length === 0) return [];
  const count = Math.min(distinctCount, subPool.length);
  const permutation = deterministicShuffle(
    subPool,
    itemId * POOL_SEED_ITEM_ID_MULTIPLIER + materialRarity,
  );
  const start = (level - 1) % permutation.length;
  const picked: number[] = [];
  for (let i = 0; i < count; i++) {
    const id = permutation[(start + i) % permutation.length];
    if (id !== undefined) picked.push(id);
  }
  return picked;
}

/** One aggregated material requirement of an upgrade level. */
export interface UpgradeMaterialNeed {
  readonly materialId: number;
  readonly quantity: number;
}

/** The item fields the upgrade recipe depends on. */
export interface UpgradeRecipeInputs {
  readonly id: number;
  readonly rarity: number;
  readonly materialCategory: number;
}

/**
 * Materials consumed to upgrade `item` to `level`, mirroring the game's
 * `MainItem.getUpgradeMaterials`: per material rarity, the vendored total
 * quantity is spread over the picked distinct ids, the first `total % picked`
 * ids taking one extra. Empty for basic items and out-of-range levels.
 */
export function computeUpgradeMaterials(
  item: UpgradeRecipeInputs,
  level: number,
  pools: ReadonlyMap<number, ItemMaterialPool>,
  distinctCounts: readonly ItemUpgradeDistinctCounts[],
): UpgradeMaterialNeed[] {
  if (level < 1 || level > MAX_UPGRADE_LEVEL) return [];
  const totals = UPGRADE_MATERIAL_TOTALS[item.rarity]?.[level - 1];
  const counts = distinctCounts[item.rarity]?.levels[level - 1];
  const pool = pools.get(item.materialCategory);
  if (!totals || !counts || !pool) return [];

  const perRarity = [
    {
      rarity: 1,
      total: totals[0],
      distinct: counts.common,
      subPool: pool.common,
    },
    {
      rarity: 2,
      total: totals[1],
      distinct: counts.uncommon,
      subPool: pool.uncommon,
    },
    { rarity: 3, total: totals[2], distinct: counts.rare, subPool: pool.rare },
  ];
  const needs: UpgradeMaterialNeed[] = [];
  for (const { rarity, total, distinct, subPool } of perRarity) {
    if (total <= 0) continue;
    const distinctCount = Math.min(distinct, subPool.length, total);
    if (distinctCount <= 0) continue;
    const picked = pickDistinctMaterials(
      subPool,
      item.id,
      rarity,
      level,
      distinctCount,
    );
    const base = Math.floor(total / picked.length);
    const remainder = total % picked.length;
    picked.forEach((materialId, index) => {
      needs.push({ materialId, quantity: base + (index < remainder ? 1 : 0) });
    });
  }
  return needs;
}

/**
 * Base value of the formula-driven main stat (weapon attack / armor defense)
 * before any upgrade, mirroring the game's shared exponential in
 * `Weapon.getBaseAttack` / `Armor.getBaseDefense`. `flat` is the optional
 * same-name flat bonus the item JSON may add on top.
 */
export function computeBaseMainStat(
  rarity: number,
  raw: number,
  flat: number,
): number {
  const multiplier = RARITY_MULTIPLIER[rarity] ?? 1;
  const { SCALE, RARITY_EXPONENT, GROWTH_BASE, GROWTH_BONUS } =
    MAIN_STAT_FORMULA;
  return (
    Math.round(
      SCALE *
        Math.pow(multiplier, RARITY_EXPONENT) *
        Math.pow(GROWTH_BASE + GROWTH_BONUS / multiplier, raw),
    ) + flat
  );
}

/**
 * A base stat at an upgrade level: the game multiplies positive stats by the
 * level multiplier and rounds; zero and negative stats pass through untouched.
 */
export function applyUpgradeLevel(baseStat: number, level: number): number {
  if (baseStat <= 0) return baseStat;
  const clamped = Math.min(
    Math.max(level, 0),
    UPGRADE_LEVEL_STATS_MULTIPLIER.length - 1,
  );
  return Math.round(baseStat * (UPGRADE_LEVEL_STATS_MULTIPLIER[clamped] ?? 1));
}

/**
 * An item's coin value (`ItemUtils.getItemValue`): rarity base value plus the
 * item's added value (its raw main stat, or its power for potions and objects).
 * Note the game never pays for a sold potion, whatever this value is.
 */
export function computeItemValue(rarity: number, addedValue: number): number {
  return Math.round((RARITY_VALUES[rarity] ?? 0) + addedValue);
}
