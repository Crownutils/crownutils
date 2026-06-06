const UNIT_TO_MS = {
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
} as const;

export function parseDuration(input: string): number | null {
  const pattern = /(\d+)(s|m|h|d)/g;
  const validPattern = /^(\d+(s|m|h|d))+$/;
  if (!validPattern.test(input)) {
    return null;
  }

  let total = 0;
  for (const match of input.matchAll(pattern)) {
    const value = Number(match[1]);
    const unit = match[2] as keyof typeof UNIT_TO_MS;
    total += value * UNIT_TO_MS[unit];
  }

  return total;
}
