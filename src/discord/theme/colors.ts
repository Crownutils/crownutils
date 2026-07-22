/** Accent palette for containers, named by intent so callers never pick raw hex. */
export const colors = {
  brand: 0xffb5c0,
  default: 0x000000,
  cancel: 0xe41b1e,
  success: 0x008000,
  warn: 0xc74d00,
  blurple: 0x5865f2,
  gray: 0x5a5458,
} as const;

/** A named color of the {@link colors} palette. */
export type ColorName = keyof typeof colors;
