import { computeMainItemStats } from '../calculators/items.js';
import { loadItemIcons } from './item-icons.js';
import {
  cachedPromise,
  fetchCrowniclesJson,
  listCrowniclesDir,
  mapWithConcurrency,
} from './source.js';

/** The four item categories Crownicles exposes under `Core/resources`. */
export const ITEM_CATEGORIES = [
  'weapons',
  'armors',
  'objects',
  'potions',
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

/**
 * One Crownicles item, merging its stats (from the numbered resource file)
 * with its display name (from `Lang/fr/models.json`). Stat fields are present
 * only for the categories that define them: `attack` for weapons, `defense`
 * for armors, `power`/`nature` for objects and potions.
 */
export interface CrowniclesItem {
  id: number;
  category: ItemCategory;
  name: string;
  /** Unicode emote of the item; undefined if not found in the icon source. */
  icon?: string;
  rarity: number;
  /** Main items only - final stats after rarity scaling. */
  attack?: number;
  defense?: number;
  speed?: number;
  /** Support items only (objects, potions). */
  power?: number;
  nature?: number;
}

/** Raw shape of a `Core/resources/<category>/<id>.json` stat file. */
interface RawItemStats {
  rarity: number;
  rawAttack?: number;
  rawDefense?: number;
  attack?: number;
  defense?: number;
  speed?: number;
  power?: number;
  nature?: number;
}

/** Main-item categories scale a raw stat by rarity; the rest are support items. */
const MAIN_ITEM_SCALED_STAT = {
  weapons: 'attack',
  armors: 'defense',
} as const;

/** `models.json` only the item-name maps are read from, keyed by id string. */
type ItemNames = Record<ItemCategory, Record<string, string>>;

const HTTP_CONCURRENCY = 10;

/** Loads the item name maps once; the promise is cached, evicted on failure. */
const loadNames = cachedPromise(() =>
  fetchCrowniclesJson<ItemNames>('Lang/fr/models.json'),
);

/** Per-category memoized loaders, so each category is fetched at most once. */
const itemsLoaders = new Map<ItemCategory, () => Promise<CrowniclesItem[]>>();

/** Merges a raw stat file, a name and an icon into a `CrowniclesItem`. */
function toItem(
  category: ItemCategory,
  id: number,
  name: string,
  icon: string | undefined,
  stats: RawItemStats,
): CrowniclesItem {
  const base = { id, category, name, icon, rarity: stats.rarity };

  const scaledStat =
    category in MAIN_ITEM_SCALED_STAT
      ? MAIN_ITEM_SCALED_STAT[category as keyof typeof MAIN_ITEM_SCALED_STAT]
      : undefined;

  if (scaledStat) {
    return {
      ...base,
      ...computeMainItemStats(stats.rarity, stats, scaledStat),
    };
  }

  return { ...base, power: stats.power, nature: stats.nature };
}

/** Fetches the directory listing and every stat file of `category`. */
async function loadCategory(category: ItemCategory): Promise<CrowniclesItem[]> {
  const [names, icons, fileNames] = await Promise.all([
    loadNames(),
    loadItemIcons(),
    listCrowniclesDir(`Core/resources/${category}`),
  ]);

  const ids = fileNames
    .map((file) => parseInt(file, 10))
    .filter((id) => Number.isInteger(id))
    .sort((a, b) => a - b);

  const stats = await mapWithConcurrency(ids, HTTP_CONCURRENCY, (id) =>
    fetchCrowniclesJson<RawItemStats>(`Core/resources/${category}/${id}.json`),
  );

  return ids.map((id, index) =>
    toItem(
      category,
      id,
      names[category][String(id)] ?? '???',
      icons[category][String(id)],
      stats[index]!,
    ),
  );
}

/**
 * Returns every item of `category`, fetched from the Crownicles repo on first
 * access and cached for the process lifetime. A failed load is not cached, so
 * the next call retries.
 */
export function getItems(category: ItemCategory): Promise<CrowniclesItem[]> {
  let load = itemsLoaders.get(category);
  if (!load) {
    load = cachedPromise(() => loadCategory(category));
    itemsLoaders.set(category, load);
  }
  return load();
}
