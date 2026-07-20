import type { SupportedLocale } from '@/core/types.js';

/**
 * Selects the grammatically correct form for `count` in `locale`.
 */
export function plural(
  locale: SupportedLocale,
  count: number,
  forms: { readonly one: string; readonly other: string },
): string {
  const category = new Intl.PluralRules(locale).select(count);
  return category === 'one' ? forms.one : forms.other;
}
