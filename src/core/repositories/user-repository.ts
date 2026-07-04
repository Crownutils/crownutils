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
