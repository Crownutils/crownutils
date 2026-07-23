import type { SupportedLocale } from '@/core/types.js';
import { cachePerLocale } from './cache.js';
import type { ItemCategory } from './item-constants.js';
import { fetchCrowniclesJson } from './source.js';

/** The slices of `Lang/<locale>/models.json` the bot reads. */
export interface CrowniclesModels {
  readonly map_locations?: Record<string, { name?: string }>;
  readonly map_types?: Record<string, { name?: string; prefix?: string }>;
  /** Material id -> official name. */
  readonly materials?: Record<string, string>;
  /** Material rarity level (`1`..`3`) -> official name. */
  readonly materialRarityNames?: Record<string, string>;
  /** Cooking display strings; `recipes` maps a recipe id to its official name. */
  readonly cooking?: { readonly recipes?: Record<string, string> };
  /** Item id -> official name, one record per item category. */
  readonly weapons?: Record<string, string>;
  readonly armors?: Record<string, string>;
  readonly potions?: Record<string, string>;
  readonly objects?: Record<string, string>;
}

/**
 * The Crownicles `models.json` display strings for `locale`, cached per locale.
 * Shared by every reader (locations, map types, materials), so the file is
 * fetched a single time per locale.
 */
export const getModels = cachePerLocale((locale: SupportedLocale) =>
  fetchCrowniclesJson<CrowniclesModels>(`Lang/${locale}/models.json`),
);

/** Localized location-type names keyed by type code (e.g. `ci` -> `City`); empty ones dropped. */
export async function getMapTypeNames(
  locale: SupportedLocale,
): Promise<Record<string, string>> {
  const types = (await getModels(locale)).map_types ?? {};
  const names: Record<string, string> = {};
  for (const [code, info] of Object.entries(types)) {
    if (info.name) names[code] = info.name;
  }
  return names;
}

/**
 * Localized location names keyed by id string. Covers every id in `models.json`
 * (including special ones without a resource file), so it resolves map-link
 * endpoints the location loader would skip.
 */
export async function getLocationNames(
  locale: SupportedLocale,
): Promise<Record<string, string>> {
  const locations = (await getModels(locale)).map_locations ?? {};
  const names: Record<string, string> = {};
  for (const [id, info] of Object.entries(locations)) {
    if (info.name) names[id] = info.name;
  }
  return names;
}

/** Official material names keyed by id string. */
export async function getMaterialNames(
  locale: SupportedLocale,
): Promise<Record<string, string>> {
  return (await getModels(locale)).materials ?? {};
}

/** Official material rarity names keyed by level (`1`..`3`). */
export async function getMaterialRarityNames(
  locale: SupportedLocale,
): Promise<Record<string, string>> {
  return (await getModels(locale)).materialRarityNames ?? {};
}

/** Official item names of one category, keyed by id string (id `0` is the empty-slot placeholder). */
export async function getItemNames(
  locale: SupportedLocale,
  category: ItemCategory,
): Promise<Record<string, string>> {
  return (await getModels(locale))[category] ?? {};
}

/** Official cooking recipe names keyed by recipe id (e.g. `material_alloy_1`). */
export async function getRecipeNames(
  locale: SupportedLocale,
): Promise<Record<string, string>> {
  return (await getModels(locale)).cooking?.recipes ?? {};
}
