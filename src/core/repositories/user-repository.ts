import { prisma } from '../persistence/client.js';
import type { SupportedLocale } from '../types.js';
import { isOwner, type Rank } from '../permissions/index.js';
import { acceptLegal } from './legal-repository.js';
import { TtlCache } from '../cache/ttl-cache.js';

const DEFAULT_LANGUAGE: SupportedLocale = 'en';
const DEFAULT_RANK: Rank = 'normal';

const USER_CACHE_MAX_SIZE = 10_000;
const USER_CACHE_TTL_MS = 5 * 60 * 1000;

/** A user's stored language and rank, resolved together from a single row read. */
export interface UserProfile {
  readonly language: SupportedLocale;
  readonly rank: Rank;
}

/** One entry per user row, so language and rank share a single cache and invalidation. */
const userCache = new TtlCache<string, UserProfile>(
  USER_CACHE_MAX_SIZE,
  USER_CACHE_TTL_MS,
);

/** Merge a field update into a user's cached profile, only if they are currently cached. */
function patchUserCache(userId: string, patch: Partial<UserProfile>): void {
  const cached = userCache.get(userId);
  if (cached !== undefined) userCache.set(userId, { ...cached, ...patch });
}

async function loadUserProfile(userId: string): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { userId },
    select: { language: true, rank: true },
  });
  return {
    language: user?.language ?? DEFAULT_LANGUAGE,
    rank: user?.rank ?? DEFAULT_RANK,
  };
}

/** Creates `userId`'s account: owner is promoted, the language is stored, and the legal docs are accepted. */
export async function registerUser(userId: string, language: SupportedLocale) {
  if (isOwner(userId)) {
    await setUserRank(userId, 'owner');
  }
  await setUserLanguage(userId, language);
  await acceptLegal(userId);
}

/**
 * Reads `userId`'s language and rank together, caching the whole row so
 * repeated lookups within the TTL never touch the database. Preferred over
 * {@link getUserLanguage} plus {@link getUserRank}, which now delegate here.
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  return userCache.getOrLoad(userId, loadUserProfile);
}

/** Returns a user's preferred language, defaulting to `en` when they have no row yet. */
export async function getUserLanguage(
  userId: string,
): Promise<SupportedLocale> {
  return (await getUserProfile(userId)).language;
}

/** Persist a user's preferred language, creating the row if it does not exist. */
export async function setUserLanguage(
  userId: string,
  language: SupportedLocale,
): Promise<void> {
  await prisma.user.upsert({
    where: { userId },
    update: { language },
    create: { userId, language },
  });

  patchUserCache(userId, { language });
}

/** Returns a user's rank, defaulting to `normal` when they have no row yet. */
export async function getUserRank(userId: string): Promise<Rank> {
  return (await getUserProfile(userId)).rank;
}

/** Persist a user's rank, creating the row if it does not exist. */
export async function setUserRank(userId: string, rank: Rank): Promise<void> {
  await prisma.user.upsert({
    where: { userId },
    update: { rank },
    create: { userId, rank },
  });

  patchUserCache(userId, { rank });
}
