import { TtlCache } from '@/core/cache/ttl-cache.js';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/core/types.js';

/**
 * Caching strategy for all Crownicles game data fetched at runtime.
 *
 * The game's data changes rarely, so every loader is wrapped so its result is
 * fetched once and reused for a long TTL: the first command pays the network
 * cost, every later one is instant, and stale data still self-heals when the
 * TTL lapses. A failed load is never cached (the wrappers rely on
 * {@link TtlCache.getOrLoad}, which only stores a resolved value), so the next
 * call retries. This module is the single place that decides all of that.
 */

/** Lifetime of a cached game-data value. */
export const GAME_DATA_TTL_MS = 12 * 60 * 60 * 1000;

/** One cache slot per served locale, so no locale ever evicts another. */
const LOCALE_CACHE_SIZE = SUPPORTED_LOCALES.length;

/**
 * Wraps a per-locale loader so it runs at most once per locale per TTL. Use for
 * anything whose result depends on the language (names, localized events, …).
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
 * shared tables (icon sets, loot tables, …) identical in every language.
 */
export function cacheShared<V extends NonNullable<unknown>>(
  load: () => Promise<V>,
): () => Promise<V> {
  const cache = new TtlCache<'shared', V>(1, GAME_DATA_TTL_MS);
  return () => cache.getOrLoad('shared', load);
}
