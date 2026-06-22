const UNIT_TO_MS = {
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
} as const;

type DurationUnit = keyof typeof UNIT_TO_MS;

/** Largest delay accepted by `setTimeout` (~24.8 days). */
export const MAX_TIMEOUT_MS = 2_147_483_647;

const UNITS = Object.keys(UNIT_TO_MS).join('');
const SEGMENT = `\\d+[${UNITS}]`;
const DURATION_PATTERN = new RegExp(`^(?:${SEGMENT})+$`);
const SEGMENT_PATTERN = new RegExp(`(\\d+)([${UNITS}])`, 'g');

/**
 * Parses a duration string like `1d2h30m` into milliseconds. Returns `null`
 * if `input` doesn't match the repeating `<number><unit>` pattern.
 */
export function parseDurationMs(input: string): number | null {
  if (!DURATION_PATTERN.test(input)) {
    return null;
  }

  let total = 0;
  for (const [, value, unit] of input.matchAll(SEGMENT_PATTERN)) {
    total += Number(value) * UNIT_TO_MS[unit as DurationUnit];
  }

  return total;
}

/** True if `a` and `b` fall on the same calendar day in UTC. */
export function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}
