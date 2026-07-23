import type { SupportedLocale } from '@/core/types.js';
import { cachePerLocale, cacheShared } from './cache.js';
import { ITEM_CATEGORIES, type ItemCategory } from './item-constants.js';
import { getItemNames } from './models.js';
import {
  fetchCrowniclesJson,
  fetchCrowniclesText,
  HTTP_CONCURRENCY,
  listCrowniclesDir,
  mapWithConcurrency,
  numericIds,
  parseIconIdBlock,
} from './source.js';

/** A weapon or armor, merging its raw stats with its localized name and emote. */
export interface CrowniclesMainItem {
  readonly id: number;
  readonly category: 'weapons' | 'armors';
  readonly name: string;
  /** Item rarity, `0` (basic) to `8` (mythical). */
  readonly rarity: number;
  readonly icon: string | undefined;
  /** Input of the exponential main-stat formula (attack for weapons, defense for armors). */
  readonly raw: number;
  /** Flat stat bonuses added on top of the formula (most items have none). */
  readonly attack: number;
  readonly defense: number;
  readonly speed: number;
  /** Blacksmith material pool id (`1`..`15`). */
  readonly materialCategory: number;
}

/** A potion or object: a nature (effect kind) applied with a power. */
export interface CrowniclesSupportItem {
  readonly id: number;
  readonly category: 'potions' | 'objects';
  readonly name: string;
  /** Item rarity, `0` (basic) to `8` (mythical). */
  readonly rarity: number;
  readonly icon: string | undefined;
  /** `ItemNature` id (`0` none .. `7` energy); see {@link FIGHT_ITEM_NATURES}. */
  readonly nature: number;
  readonly power: number;
  /** Fight-potion usage count; the game treats a missing or `0` value as `1`. */
  readonly usages: number;
}

/** Any Crownicles item; narrow with {@link isMainItem}. */
export type CrowniclesItem = CrowniclesMainItem | CrowniclesSupportItem;

/** Whether `item` is a weapon or armor (each member's `category` is a two-literal union, so `===` alone cannot narrow). */
export function isMainItem(item: CrowniclesItem): item is CrowniclesMainItem {
  return item.category === 'weapons' || item.category === 'armors';
}

/** Raw `Core/resources/{weapons,armors}/<id>.json` shape. */
interface RawMainItem {
  readonly rarity: number;
  readonly rawAttack?: number;
  readonly rawDefense?: number;
  readonly attack?: number;
  readonly defense?: number;
  readonly speed?: number;
  readonly materialCategory: number;
}

/** Raw `Core/resources/{potions,objects}/<id>.json` shape. */
interface RawSupportItem {
  readonly rarity: number;
  readonly power: number;
  readonly nature: number;
  readonly usages?: number;
  readonly fallbackEmote?: string;
}

const ICONS_SOURCE_PATH = 'Lib/src/CrowniclesIcons.ts';

/** Item emotes by id string for each category, parsed from one icon-source fetch. */
const getItemIcons = cacheShared(async () => {
  const source = await fetchCrowniclesText(ICONS_SOURCE_PATH);
  const icons: Partial<Record<ItemCategory, Record<string, string>>> = {};
  for (const category of ITEM_CATEGORIES) {
    icons[category] = parseIconIdBlock(source, category);
  }
  return icons;
});

function isMainCategory(
  category: ItemCategory,
): category is 'weapons' | 'armors' {
  return category === 'weapons' || category === 'armors';
}

/** Builds one item from its raw JSON, resolved name and category icon set. */
async function fetchItem(
  category: ItemCategory,
  id: number,
  name: string,
  icons: Record<string, string>,
): Promise<CrowniclesItem> {
  const path = `Core/resources/${category}/${id}.json`;
  if (isMainCategory(category)) {
    const raw = await fetchCrowniclesJson<RawMainItem>(path);
    return {
      id,
      category,
      name,
      rarity: raw.rarity,
      icon: icons[String(id)],
      raw: (category === 'weapons' ? raw.rawAttack : raw.rawDefense) ?? 0,
      attack: raw.attack ?? 0,
      defense: raw.defense ?? 0,
      speed: raw.speed ?? 0,
      materialCategory: raw.materialCategory,
    };
  }
  const raw = await fetchCrowniclesJson<RawSupportItem>(path);
  return {
    id,
    category,
    name,
    rarity: raw.rarity,
    icon: icons[String(id)] ?? raw.fallbackEmote,
    nature: raw.nature,
    power: raw.power,
    // `||` on purpose: the game maps an explicit `usages: 0` to one usage too.
    usages: raw.usages || 1,
  };
}

/** Fetches every item of every category with its `locale` name, stats and emote. */
async function loadItems(locale: SupportedLocale): Promise<CrowniclesItem[]> {
  const icons = await getItemIcons();
  const perCategory = await Promise.all(
    ITEM_CATEGORIES.map(async (category) => {
      const [names, files] = await Promise.all([
        getItemNames(locale, category),
        listCrowniclesDir(`Core/resources/${category}`),
      ]);
      return { category, names, ids: numericIds(files) };
    }),
  );
  const entries = perCategory.flatMap(({ category, names, ids }) =>
    ids.map((id) => ({ category, id, name: names[String(id)] ?? '???' })),
  );
  return mapWithConcurrency(entries, HTTP_CONCURRENCY, (entry) =>
    fetchItem(
      entry.category,
      entry.id,
      entry.name,
      icons[entry.category] ?? {},
    ),
  );
}

/** Every item for `locale`, cached per locale (see {@link cachePerLocale}). */
export const getItems = cachePerLocale(loadItems);

/** The `Lang/<locale>/items.json` slices the bot reads. */
interface RawItemsLang {
  readonly rarities?: readonly string[];
  readonly potionsNatures?: readonly string[];
  readonly objectsNatures?: readonly string[];
}

/** Localized item display strings, emote placeholders stripped. */
export interface ItemLangStrings {
  /** Official rarity names indexed by rarity (`0`..`8`). */
  readonly rarityNames: readonly string[];
  /** Potion effect lines indexed by nature id; see {@link formatNatureEffect}. */
  readonly potionNatures: readonly string[];
  /** Object effect lines indexed by nature id; see {@link formatNatureEffect}. */
  readonly objectNatures: readonly string[];
}

/** Drops the `{emote:...}` placeholders the game injects into its lang strings. */
function stripEmotePlaceholders(text: string): string {
  return text.replace(/\{emote:[^}]*\}/g, '').trim();
}

/** The item display strings of `Lang/<locale>/items.json`, cached per locale. */
export const getItemLangStrings = cachePerLocale(
  async (locale: SupportedLocale): Promise<ItemLangStrings> => {
    const raw = await fetchCrowniclesJson<RawItemsLang>(
      `Lang/${locale}/items.json`,
    );
    return {
      rarityNames: (raw.rarities ?? []).map(stripEmotePlaceholders),
      potionNatures: (raw.potionsNatures ?? []).map(stripEmotePlaceholders),
      objectNatures: (raw.objectsNatures ?? []).map(stripEmotePlaceholders),
    };
  },
);

/** Substitutes the `{{power}}` / `{{power, number}}` placeholder of a nature line. */
export function formatNatureEffect(template: string, power: number): string {
  return template.replace(/\{\{power[^}]*\}\}/g, String(power));
}
