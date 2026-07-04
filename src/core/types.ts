/** Locales the bot speaks; mirrors the Prisma `Language` enum. */
export const SUPPORTED_LOCALES = ['fr', 'en'] as const;

/** A language the bot can reply in. */
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Narrow an arbitrary string to a {@link SupportedLocale}. */
export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
