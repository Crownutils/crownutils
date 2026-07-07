import { prisma } from '../persistence/client.js';
import type { SupportedLocale } from '../types.js';
import { isOwner, type Rank } from '../permissions/index.js';
import { acceptLegal } from './legal-repository.js';

const DEFAULT_LANGUAGE: SupportedLocale = 'en';
const DEFAULT_RANK: Rank = 'normal';

/** Creates `userId`'s account: owner is promoted, the language is stored, and the legal docs are accepted. */
export async function registerUser(userId: string, language: SupportedLocale) {
  if (isOwner(userId)) {
    await setUserRank(userId, 'owner');
  }
  await setUserLanguage(userId, language);
  await acceptLegal(userId);
}

const usersLanguage: Map<string, SupportedLocale> = new Map();
const usersRank: Map<string, Rank> = new Map();

/** A user's stored language and rank, resolved together from a single row read. */
export interface UserProfile {
  readonly language: SupportedLocale;
  readonly rank: Rank;
}

/**
 * Reads `userId`'s language and rank in a single query, warming both caches.
 * Preferred over calling {@link getUserLanguage} and {@link getUserRank}
 * separately, which would hit the same row twice on a cold cache.
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const cachedLanguage = usersLanguage.get(userId);
  const cachedRank = usersRank.get(userId);
  if (cachedLanguage !== undefined && cachedRank !== undefined) {
    return { language: cachedLanguage, rank: cachedRank };
  }

  const user = await prisma.user.findUnique({
    where: { userId },
    select: { language: true, rank: true },
  });
  const language = user?.language ?? DEFAULT_LANGUAGE;
  const rank = user?.rank ?? DEFAULT_RANK;
  usersLanguage.set(userId, language);
  usersRank.set(userId, rank);

  return { language, rank };
}

/** Returns a user's preferred language, defaulting to `en` when they have no row yet. */
export async function getUserLanguage(
  userId: string,
): Promise<SupportedLocale> {
  if (usersLanguage.has(userId)) {
    return usersLanguage.get(userId)!;
  }

  const user = await prisma.user.findUnique({
    where: { userId },
    select: { language: true },
  });

  const language = user?.language ?? DEFAULT_LANGUAGE;
  usersLanguage.set(userId, language);

  return language;
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

  usersLanguage.set(userId, language);
}

/** Returns a user's rank, defaulting to `normal` when they have no row yet. */
export async function getUserRank(userId: string): Promise<Rank> {
  if (usersRank.has(userId)) {
    return usersRank.get(userId)!;
  }

  const user = await prisma.user.findUnique({
    where: { userId },
    select: { rank: true },
  });
  const rank = user?.rank ?? DEFAULT_RANK;
  usersRank.set(userId, rank);

  return rank;
}

/** Persist a user's rank, creating the row if it does not exist. */
export async function setUserRank(userId: string, rank: Rank): Promise<void> {
  await prisma.user.upsert({
    where: { userId },
    update: { rank },
    create: { userId, rank },
  });

  usersRank.set(userId, rank);
}
