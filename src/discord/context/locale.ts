import { getUserLanguage } from '@/core/repositories/user-repository.js';
import type { SupportedLocale } from '@/core/types.js';

export async function resolveUserLocale(
  userId: string,
): Promise<SupportedLocale> {
  return getUserLanguage(userId);
}
