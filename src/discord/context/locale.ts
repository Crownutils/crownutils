import { getUserLanguage } from '@/core/repositories/user-repository.js';
import type { SupportedLocale } from '@/core/types.js';

/** The locale to answer `userId` in: their stored language, `en` by default. */
export async function resolveUserLocale(
  userId: string,
): Promise<SupportedLocale> {
  return getUserLanguage(userId);
}
