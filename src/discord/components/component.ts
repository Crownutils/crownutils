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

/** A text display line; `toBuilder` yields a discord.js TextDisplayBuilder. */
export interface TextComponent {
  kind: 'text';
  toBuilder(): TextDisplayBuilder;
}

/** A separator display line; `toBuilder` yields a discord.js SeparatorBuilder. */
export interface SeparatorComponent {
  kind: 'separator';
  toBuilder(): SeparatorBuilder;
}

/** A section; `toBuilder` yields a discord.js SectionBuilder. */
export interface SectionComponent {
  kind: 'section';
  toBuilder(): SectionBuilder;
}

/** A row of buttons; `toBuilder` yields a discord.js ActionRowBuilder<ButtonBuilder>. */
export interface ActionRowComponent {
  kind: 'action-row';
  toBuilder(): ActionRowBuilder<ButtonBuilder>;
}

/** A row of a select menu; `toBuilder` yields a discord.js ActionRowBuilder<StringSelectMenuBuilder>. */
export interface SelectComponent {
  kind: 'select';
  toBuilder(): ActionRowBuilder<StringSelectMenuBuilder>;
}
