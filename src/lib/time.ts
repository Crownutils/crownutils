const UNIT_TO_MS = {
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
} as const;

type DurationUnit = keyof typeof UNIT_TO_MS;

export const MAX_TIMEOUT_MS = 2_147_483_647;

const UNITS = Object.keys(UNIT_TO_MS).join('');
const SEGMENT = `\\d+[${UNITS}]`;
const DURATION_PATTERN = new RegExp(`^(?:${SEGMENT})+$`);
const SEGMENT_PATTERN = new RegExp(`(\\d+)([${UNITS}])`, 'g');

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
