import type { SupportedLocale } from '@/core/types.js';

/** Formats `value` with locale-appropriate thousands separators (e.g. "1 000" in French, "1,000" in English). */
export function formatNumber(locale: SupportedLocale, value: number): string {
  return new Intl.NumberFormat(locale).format(value);
}
