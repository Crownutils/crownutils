const UNIT_TO_MS = {
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
} as const;

type Milliseconds = number & { readonly __brand: 'Milliseconds' };
type Seconds = number & { readonly __brand: 'Seconds' };

function ms(n: number): Milliseconds {
  return n as Milliseconds;
}

function seconds(n: number): Seconds {
  return n as Seconds;
}

export function parseDuration(input: string): Milliseconds | null {
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

  return ms(total);
}

export function msToUnixSeconds(value: Milliseconds): Seconds {
  return seconds(Math.floor(value / 1000));
}
