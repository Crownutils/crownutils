import {
  MATERIAL_BASE_PRICE,
  MATERIAL_BULK_PRICE_INCREASE_PERCENT,
  MAX_UPGRADE_LEVEL,
  MIN_UPGRADE_LEVEL,
  SCRAP_DEALER,
} from './item-constants.js';
import {
  computeItemValue,
  computeUpgradeMaterials,
  type ItemMaterialPool,
  type ItemUpgradeDistinctCounts,
  type UpgradeMaterialNeed,
  type UpgradeRecipeInputs,
} from './item-upgrades.js';

/**
 * Gorim the Ironbreaker, the scrap dealer: recycling a weapon or armor hands
 * back materials drawn from that item's own upgrade recipe -- never a random
 * pool -- until their blacksmith buying price covers the item's scaled value.
 * The payout is therefore deterministic, and a material is obtainable this way
 * exactly from the equipment whose upgrades consume it.
 */

/** The item fields a scrap payout depends on. */
export interface ScrapRecipeInputs extends UpgradeRecipeInputs {
  /** Input of the main-stat formula, which is also the item's added coin value. */
  readonly raw: number;
}

/** A single material an upgrade consumes, kept with the rarity that prices it. */
interface MaterialUnit {
  readonly materialId: number;
  readonly rarity: number;
}

/** A unit tagged with its relative position inside the list it came from. */
interface PositionedUnit {
  readonly unit: MaterialUnit;
  readonly position: number;
}

/** A {@link PositionedUnit} that also remembers which upgrade level produced it. */
interface LeveledUnit extends PositionedUnit {
  readonly level: number;
}

/** Expands aggregated needs into one unit per material consumed, unknown ids dropped. */
function expandNeeds(
  needs: readonly UpgradeMaterialNeed[],
  rarityById: ReadonlyMap<number, number>,
): MaterialUnit[] {
  return needs.flatMap((need) => {
    const rarity = rarityById.get(need.materialId);
    return rarity === undefined
      ? []
      : Array.from({ length: need.quantity }, () => ({
          materialId: need.materialId,
          rarity,
        }));
  });
}

/** Groups units by rarity, each bucket sorted by material id as the game does. */
function bucketsByRarity(units: readonly MaterialUnit[]): MaterialUnit[][] {
  const buckets = new Map<number, MaterialUnit[]>();
  for (const unit of units) {
    const bucket = buckets.get(unit.rarity) ?? [];
    bucket.push(unit);
    buckets.set(unit.rarity, bucket);
  }
  for (const bucket of buckets.values()) {
    bucket.sort((a, b) => a.materialId - b.materialId);
  }
  return [...buckets.values()];
}

/**
 * The units of one upgrade level, interleaved across the rarities it uses so a
 * partial payout keeps a mix of rarities instead of draining the common ones.
 */
function levelUnits(
  item: ScrapRecipeInputs,
  level: number,
  pools: ReadonlyMap<number, ItemMaterialPool>,
  distinctCounts: readonly ItemUpgradeDistinctCounts[],
  rarityById: ReadonlyMap<number, number>,
): MaterialUnit[] {
  const positioned = bucketsByRarity(
    expandNeeds(
      computeUpgradeMaterials(item, level, pools, distinctCounts),
      rarityById,
    ),
  ).flatMap((bucket) =>
    bucket.map<PositionedUnit>((unit, index) => ({
      unit,
      position: index / bucket.length,
    })),
  );
  positioned.sort(
    (a, b) => a.position - b.position || a.unit.rarity - b.unit.rarity,
  );
  return positioned.map((entry) => entry.unit);
}

/**
 * Every unit the item consumed to reach `itemLevel`, interleaved across levels
 * so a partial payout keeps materials from every upgrade reached rather than
 * emptying the first level before considering the next.
 */
function recipeUnits(
  item: ScrapRecipeInputs,
  itemLevel: number,
  pools: ReadonlyMap<number, ItemMaterialPool>,
  distinctCounts: readonly ItemUpgradeDistinctCounts[],
  rarityById: ReadonlyMap<number, number>,
): MaterialUnit[] {
  const maxLevel = Math.min(
    Math.max(itemLevel, MIN_UPGRADE_LEVEL),
    MAX_UPGRADE_LEVEL,
  );
  const positioned: LeveledUnit[] = [];
  for (let level = MIN_UPGRADE_LEVEL; level <= maxLevel; level++) {
    const units = levelUnits(item, level, pools, distinctCounts, rarityById);
    units.forEach((unit, index) => {
      positioned.push({ unit, position: index / units.length, level });
    });
  }
  positioned.sort((a, b) => a.position - b.position || a.level - b.level);
  return positioned.map((entry) => entry.unit);
}

/** Blacksmith price of the `count`-th material bought in one purchase (0-based). */
function unitPrice(unit: MaterialUnit, alreadyBought: number): number {
  return Math.round(
    (MATERIAL_BASE_PRICE[unit.rarity] ?? 0) *
      (1 + (alreadyBought * MATERIAL_BULK_PRICE_INCREASE_PERCENT) / 100),
  );
}

/**
 * Materials recovered by recycling `item` at `itemLevel` (`0`..`5`), mirroring
 * the game's `getScrapDealerMaterials`: units are handed out one by one, cycling
 * through the upgrade recipe, until their cumulated buying price reaches the
 * item's value scaled by its upgrade level. The bulk increase makes every extra
 * unit dearer, so the payout always terminates. Empty for items whose upgrades
 * consume nothing (basic rarity).
 */
export function computeScrapMaterials(
  item: ScrapRecipeInputs,
  itemLevel: number,
  pools: ReadonlyMap<number, ItemMaterialPool>,
  distinctCounts: readonly ItemUpgradeDistinctCounts[],
  rarityById: ReadonlyMap<number, number>,
): UpgradeMaterialNeed[] {
  const units = recipeUnits(item, itemLevel, pools, distinctCounts, rarityById);
  // A pool of free units would never reach the target value; the game's prices
  // are all positive, so this only guards against a future zeroed-out constant.
  if (units.length === 0 || units.every((unit) => unitPrice(unit, 0) <= 0)) {
    return [];
  }

  const materialsValue =
    computeItemValue(item.rarity, item.raw) *
    (SCRAP_DEALER.BASE_VALUE_MULTIPLIER +
      itemLevel * SCRAP_DEALER.VALUE_MULTIPLIER_PER_LEVEL);

  const quantityById = new Map<number, number>();
  let price = 0;
  for (let index = 0; price < materialsValue; index++) {
    const unit = units[index % units.length]!;
    price += unitPrice(unit, index);
    quantityById.set(
      unit.materialId,
      (quantityById.get(unit.materialId) ?? 0) + 1,
    );
  }
  return [...quantityById].map(([materialId, quantity]) => ({
    materialId,
    quantity,
  }));
}
