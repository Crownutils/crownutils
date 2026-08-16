import type { SupportedLocale } from '@/core/types.js';

/**
 * `Intl` groups digits and detaches the percent sign with non-breaking spaces
 * (U+00A0 before `%`, U+202F between thousands in French). They render exactly
 * like a plain space on Discord, and the language packs write their own
 * literals with a plain space, so they are folded down to keep every string the
 * bot emits on the same, greppable ASCII space.
 */
function plainSpaces(text: string): string {
  return text.replace(/[\u00A0\u202F]/g, ' ');
}

/** Formats `value` with locale-appropriate thousands separators (e.g. "1 000" in French, "1,000" in English). */
export function formatNumber(locale: SupportedLocale, value: number): string {
  return plainSpaces(new Intl.NumberFormat(locale).format(value));
}

/**
 * Formats a `0..1` ratio as a percentage, trimmed to one decimal and spelled
 * the way the locale does (e.g. `0.015` -> "1,5 %" in French, "1.5%" in
 * English). Trailing zeros are dropped, so `0.1` stays "10 %".
 */
export function formatPercent(locale: SupportedLocale, value: number): string {
  return plainSpaces(
    new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(value),
  );
}
