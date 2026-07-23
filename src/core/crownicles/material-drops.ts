import type { CrowniclesMaterial } from './materials.js';

/**
 * Drop probabilities for a material, mirroring the game's two loot mechanics.
 *
 * - Fixed pools (PVE bosses, pet expeditions) roll one member weighted by rarity
 *   ({@link RARITY_WEIGHTS}), so a member's chance is its weight over the pool's.
 * - Rarity-first sources (the `findMaterial` small event within a type, compost)
 *   roll a rarity ({@link RARITY_DROP_RATES}) then pick uniformly among the
 *   materials of that rarity in scope.
 */

/** Relative weights biasing a fixed-pool roll toward common materials (60/30/10). */
const RARITY_WEIGHTS: Record<number, number> = { 1: 60, 2: 30, 3: 10 };
/** Probability of each rarity being rolled by a rarity-first source (60/30/10 %). */
const RARITY_DROP_RATES: Record<number, number> = { 1: 0.6, 2: 0.3, 3: 0.1 };

/** Chance of drawing `material` in one roll from a rarity-weighted `pool` (`0` if absent/empty). */
export function poolDropChance(
  material: CrowniclesMaterial,
  pool: readonly CrowniclesMaterial[],
): number {
  if (!pool.some((entry) => entry.id === material.id)) return 0;
  const total = pool.reduce(
    (sum, entry) => sum + (RARITY_WEIGHTS[entry.rarity] ?? 0),
    0,
  );
  return total === 0 ? 0 : (RARITY_WEIGHTS[material.rarity] ?? 0) / total;
}

/**
 * Chance of a rarity-first source yielding `material`: its rarity's roll
 * probability split uniformly across the `sameRarityCount` materials sharing
 * that rarity in the source's scope (`0` when none).
 */
export function rarityDropChance(
  material: CrowniclesMaterial,
  sameRarityCount: number,
): number {
  if (sameRarityCount <= 0) return 0;
  return (RARITY_DROP_RATES[material.rarity] ?? 0) / sameRarityCount;
}
