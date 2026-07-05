export const colors = {
  brand: 0xffb5c0,
  default: 0x000000,
  cancel: 0xe41b1e,
  success: 0x008000,
  warn: 0xc74d00,
} as const;

export type EmbedColor = keyof typeof colors;
