import type { SupportedLocale } from '@/core/types.js';
import { cachePerLocale } from './cache.js';
import { fetchCrowniclesJson } from './source.js';

/** The slices of `Lang/<locale>/models.json` the bot reads. */
export interface CrowniclesModels {
  readonly map_locations?: Record<string, { name?: string }>;
  readonly map_types?: Record<string, { name?: string; prefix?: string }>;
}

/**
 * The Crownicles `models.json` display strings for `locale`, cached per locale.
 * Shared by every reader (locations, map types), so the file is fetched a
 * single time per locale.
 */
export const getModels = cachePerLocale((locale: SupportedLocale) =>
  fetchCrowniclesJson<CrowniclesModels>(`Lang/${locale}/models.json`),
);

/** Localized location-type names keyed by type code (e.g. `ci` → `City`); empty ones dropped. */
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
