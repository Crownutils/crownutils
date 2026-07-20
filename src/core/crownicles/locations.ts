import { TtlCache } from '@/core/cache/ttl-cache.js';
import type { SupportedLocale } from '@/core/types.js';
import { locationTypeIcons } from './icons.js';
import { getModels } from './models.js';
import {
  fetchCrowniclesJson,
  HTTP_CONCURRENCY,
  listCrowniclesDir,
  mapWithConcurrency,
  numericIds,
} from './source.js';

/** Locales the bot serves; a lifetime bound sized to hold every one at once. */
const MAX_CACHED_LOCALES = 4;
/** Game data changes rarely; a long TTL keeps it warm while still self-healing. */
const DATA_TTL_MS = 12 * 60 * 60 * 1000;

/** A location on the Crownicles map, with its localized name and type emote. */
export interface CrowniclesLocation {
  readonly id: number;
  readonly name: string;
  /** Location type code (e.g. `vi`, `ci`, `fo`); drives {@link CrowniclesLocation.icon}. */
  readonly type: string;
  /** Unicode emote of the location type, or `undefined` for an unknown type. */
  readonly icon: string | undefined;
}

/** Raw shape of a `Core/resources/mapLocations/<id>.json` file. */
interface RawLocation {
  readonly type: string;
  readonly attribute?: string;
}

const LOCATIONS_DIR = 'Core/resources/mapLocations';

const cache = new TtlCache<SupportedLocale, CrowniclesLocation[]>(
  MAX_CACHED_LOCALES,
  DATA_TTL_MS,
);

/** Fetches every location with its `locale` name, in one pass. */
async function loadLocations(
  locale: SupportedLocale,
): Promise<CrowniclesLocation[]> {
  const [models, files] = await Promise.all([
    getModels(locale),
    listCrowniclesDir(LOCATIONS_DIR),
  ]);
  const names = models.map_locations ?? {};
  const ids = numericIds(files);

  const raw = await mapWithConcurrency(ids, HTTP_CONCURRENCY, (id) =>
    fetchCrowniclesJson<RawLocation>(`${LOCATIONS_DIR}/${id}.json`),
  );

  return ids.map((id, index) => {
    const type = raw[index]!.type;
    return {
      id,
      name: names[String(id)]?.name ?? '???',
      type,
      icon: locationTypeIcons[type],
    };
  });
}

/**
 * Every Crownicles location for `locale`, fetched from the public repo on first
 * access and cached per locale ({@link DATA_TTL_MS}). A failed load throws
 * before caching, so the next call retries.
 */
export function getCrowniclesLocations(
  locale: SupportedLocale,
): Promise<CrowniclesLocation[]> {
  return cache.getOrLoad(locale, loadLocations);
}
