import type { SeparatorBuilder, TextDisplayBuilder } from 'discord.js';

export type V2Component = TextComponent | SeparatorComponent;

export interface TextComponent {
  kind: 'text';
  toBuilder(): TextDisplayBuilder;
}

export interface SeparatorComponent {
  kind: 'separator';
  toBuilder(): SeparatorBuilder;
}
