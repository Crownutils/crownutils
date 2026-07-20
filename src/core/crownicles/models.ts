import { TtlCache } from '@/core/cache/ttl-cache.js';
import type { SupportedLocale } from '@/core/types.js';
import { fetchCrowniclesJson } from './source.js';

/** The slices of `Lang/<locale>/models.json` the bot reads. */
export interface CrowniclesModels {
  readonly map_locations?: Record<string, { name?: string }>;
  readonly map_types?: Record<string, { name?: string; prefix?: string }>;
}

/** Locales the bot serves; a lifetime bound sized to hold every one at once. */
const MAX_CACHED_LOCALES = 4;
/** Game data changes rarely; a long TTL keeps it warm while still self-healing. */
const DATA_TTL_MS = 12 * 60 * 60 * 1000;

const cache = new TtlCache<SupportedLocale, CrowniclesModels>(
  MAX_CACHED_LOCALES,
  DATA_TTL_MS,
);

/**
 * The Crownicles `models.json` display strings for `locale`, fetched once and
 * cached ({@link DATA_TTL_MS}). Shared by every reader (locations, map types),
 * so the file is fetched a single time per locale.
 */
export function getModels(locale: SupportedLocale): Promise<CrowniclesModels> {
  return cache.getOrLoad(locale, (key) =>
    fetchCrowniclesJson<CrowniclesModels>(`Lang/${key}/models.json`),
  );
}

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
