import { TtlCache } from '@/core/cache/ttl-cache.js';
import { GAME_DATA_TTL_MS } from './cache.js';
import { fetchCrowniclesJson } from './source.js';

/** The two locations a Crownicles map link connects. */
export interface MapLink {
  readonly startMap: number;
  readonly endMap: number;
}

const LINKS_DIR = 'Core/resources/mapLinks';
/** Few distinct links are ever referenced by events; this bound comfortably holds them. */
const MAX_CACHED_LINKS = 64;

/**
 * A per-id cache (not one of the {@link cacheShared} helpers): links are fetched
 * individually and missing ids (404) must stay uncached so they can retry.
 */
const cache = new TtlCache<number, MapLink>(MAX_CACHED_LINKS, GAME_DATA_TTL_MS);

/** Fetches one link, or `undefined` if it has no resource file (some ids 404). */
async function fetchLink(id: number): Promise<MapLink | undefined> {
  try {
    const raw = await fetchCrowniclesJson<MapLink>(`${LINKS_DIR}/${id}.json`);
    return { startMap: raw.startMap, endMap: raw.endMap };
  } catch {
    return undefined;
  }
}

/** One map link by id (cached), or `undefined` when the id has no resource file. */
async function getMapLink(id: number): Promise<MapLink | undefined> {
  const cached = cache.get(id);
  if (cached !== undefined) return cached;
  const link = await fetchLink(id);
  if (link !== undefined) cache.set(id, link);
  return link;
}

/** Resolves `ids` to a map of the links that exist (missing ids are dropped). */
export async function getMapLinks(
  ids: readonly number[],
): Promise<ReadonlyMap<number, MapLink>> {
  const entries = await Promise.all(
    ids.map(async (id) => [id, await getMapLink(id)] as const),
  );
  return new Map(
    entries.filter(
      (entry): entry is [number, MapLink] => entry[1] !== undefined,
    ),
  );
}
