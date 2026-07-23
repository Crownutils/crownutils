import { TtlCache } from '@/core/cache/ttl-cache.js';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/core/types.js';

/**
 * Caching strategy for all Crownicles game data fetched at runtime: the data
 * changes rarely, so each loader runs once and its result is reused for a long
 * TTL. A failed load is never cached ({@link TtlCache.getOrLoad} only stores a
 * resolved value), so the next call retries.
 */

/** Lifetime of a cached game-data value. */
export const GAME_DATA_TTL_MS = 12 * 60 * 60 * 1000;

/** One cache slot per served locale, so no locale ever evicts another. */
const LOCALE_CACHE_SIZE = SUPPORTED_LOCALES.length;

/**
 * Wraps a per-locale loader so it runs at most once per locale per TTL. Use for
 * anything whose result depends on the language (names, localized events, ...).
 */
export function cachePerLocale<V extends NonNullable<unknown>>(
  load: (locale: SupportedLocale) => Promise<V>,
): (locale: SupportedLocale) => Promise<V> {
  const cache = new TtlCache<SupportedLocale, V>(
    LOCALE_CACHE_SIZE,
    GAME_DATA_TTL_MS,
  );
  return (locale) => cache.getOrLoad(locale, load);
}

/**
 * Wraps a locale-independent loader so it runs at most once per TTL. Use for
 * shared tables (icon sets, loot tables, ...) identical in every language.
 */
export function cacheShared<V extends NonNullable<unknown>>(
  load: () => Promise<V>,
): () => Promise<V> {
  const cache = new TtlCache<'shared', V>(1, GAME_DATA_TTL_MS);
  return () => cache.getOrLoad('shared', load);
}
