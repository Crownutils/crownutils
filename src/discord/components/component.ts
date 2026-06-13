import type {
  ActionRowBuilder,
  ButtonBuilder,
  SectionBuilder,
  SeparatorBuilder,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
} from 'discord.js';

/**
 * Anything that can be added to a {@link Container}. `kind` lets
 * `Container.build()` dispatch to the matching `addXxxComponents` call on
 * the underlying `ContainerBuilder`.
 */
export type V2Component =
  | TextComponent
  | SeparatorComponent
  | SectionComponent
  | ActionRowComponent
  | SelectComponent;

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

export interface SelectComponent {
  kind: 'select';
  toBuilder(): ActionRowBuilder<StringSelectMenuBuilder>;
}
