export const colors = {
  brand: 0x1abc9c,
  default: 0x000000,
} as const;

export type EmbedColor = keyof typeof colors;
