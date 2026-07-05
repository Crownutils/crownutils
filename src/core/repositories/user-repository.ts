import { prisma } from '../persistence/client.js';
import type { SupportedLocale } from '../types.js';
import { acceptLegal } from './legal-repository.js';

const DEFAULT_LANGUAGE: SupportedLocale = 'en';

export async function registerUser(userId: string, language: SupportedLocale) {
  await setUserLanguage(userId, language);
  await acceptLegal(userId);
}

const usersLanguage: Map<string, SupportedLocale> = new Map();

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
