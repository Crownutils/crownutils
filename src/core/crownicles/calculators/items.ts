/**
 * Rarity multipliers (index = rarity 0..8), reimplemented from the Crownicles
 * stat curve. Formulas and constants are facts, reproduced here in our own
 * code per the project NOTICE.
 */
const RARITY_MULTIPLIERS = [1, 1.5, 2.1, 2.8, 3.6, 4.5, 5.5, 6.6, 6.7];

/** Raw stat fields a main item (weapon/armor) carries in its resource file. */
export interface RawMainItemStats {
  rawAttack?: number;
  rawDefense?: number;
  attack?: number;
  defense?: number;
  speed?: number;
}

/** Final displayed stats of a main item, after rarity scaling. */
export interface MainItemStats {
  attack: number;
  defense: number;
  speed: number;
}

/**
 * Scales a raw attack/defense value by rarity, matching the game's curve:
 * `round(1.15053 · m^2.3617 · (1.0569 + 0.1448/m)^raw)` where `m` is the
 * rarity multiplier.
 */
function scaleRawStat(raw: number, rarity: number): number {
  const m = RARITY_MULTIPLIERS[rarity] ?? 1;
  return Math.round(
    1.15053 * Math.pow(m, 2.3617) * Math.pow(1.0569 + 0.1448 / m, raw),
  );
}

/**
 * Computes a main item's displayed stats. The `scaled` stat (attack for
 * weapons, defense for armors) is derived from its raw value via
 * {@link scaleRawStat} then added to its flat bonus; the other two stats are
 * the flat values as-is.
 */
export function computeMainItemStats(
  rarity: number,
  raw: RawMainItemStats,
  scaled: 'attack' | 'defense',
): MainItemStats {
  const stats: MainItemStats = {
    attack: raw.attack ?? 0,
    defense: raw.defense ?? 0,
    speed: raw.speed ?? 0,
  };

  if (scaled === 'attack') {
    stats.attack = scaleRawStat(raw.rawAttack ?? 0, rarity) + (raw.attack ?? 0);
  } else {
    stats.defense =
      scaleRawStat(raw.rawDefense ?? 0, rarity) + (raw.defense ?? 0);
  }

  return stats;
}
