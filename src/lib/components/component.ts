import type {
  ActionRowBuilder,
  ButtonBuilder,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
} from 'discord.js';

export type V2Component =
  | TextComponent
  | SeparatorComponent
  | SectionComponent
  | ActionRowComponent;

export interface TextComponent {
  kind: 'text';
  toBuilder(): TextDisplayBuilder;
}

export interface SeparatorComponent {
  kind: 'separator';
  toBuilder(): SeparatorBuilder;
}

export interface SectionComponent {
  kind: 'section';
  toBuilder(): SectionBuilder;
}

export interface ActionRowComponent {
  kind: 'action-row';
  toBuilder(): ActionRowBuilder<ButtonBuilder>;
}
