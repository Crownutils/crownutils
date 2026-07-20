/** Duration applied when `remind` is invoked with no arguments at all. */
export const DEFAULT_REMINDER_DURATION = '9m45s';

const UNIT_MS = {
  y: 31_536_000_000,
  w: 604_800_000,
  d: 86_400_000,
  h: 3_600_000,
  m: 60_000,
  s: 1000,
} as const;

const DURATION_PATTERN = /^(?:\d+(?:y|w|d|h|m|s))+$/;
const DURATION_PART = /(\d+)(y|w|d|h|m|s)/g;

/** Parses a compact duration like `1h30m`, `45s`, `2d` into ms; `null` if malformed or zero. */
export function parseDurationMs(input: string): number | null {
  const normalized = input.trim().toLowerCase();
  if (!DURATION_PATTERN.test(normalized)) return null;

  let total = 0;
  for (const match of normalized.matchAll(DURATION_PART)) {
    const amount = match[1];
    const unit = match[2];
    if (amount === undefined || unit === undefined) continue;
    total += Number(amount) * UNIT_MS[unit as keyof typeof UNIT_MS];
  }
  return total > 0 ? total : null;
}
