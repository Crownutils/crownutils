import { prisma } from '../persistence/client.js';
import type { SupportedLocale } from '../types.js';

async function findOrCreateUser(userId: string) {
  return prisma.user.upsert({
    where: { userId },
    update: {},
    create: { userId, language: 'en' },
  });
}

export async function getUserLanguage(
  userId: string,
): Promise<SupportedLocale> {
  const user = await findOrCreateUser(userId);
  return user.language;
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
}
