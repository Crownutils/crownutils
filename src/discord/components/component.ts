import type {
  ActionRowBuilder,
  ButtonBuilder,
  ContainerBuilder,
  SectionBuilder,
  SeparatorBuilder,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
  UserSelectMenuBuilder,
} from 'discord.js';

/**
 * A component that can attach itself to a Components V2 container. Implemented
 * by every top-level wrapper so `Container.add(...)` stays type-safe without a
 * discriminated switch.
 */
export interface ContainerChild {
  attachToContainer(container: ContainerBuilder): void;
}

/** A component that can sit inside an action row (button, select menu). */
export interface RowChild {
  toBuilder(): ButtonBuilder | StringSelectMenuBuilder | UserSelectMenuBuilder;
}

/** A discord.js builder for a component allowed at the top level of a Components V2 message. */
export type TopLevelComponentBuilder =
  | ContainerBuilder
  | SectionBuilder
  | TextDisplayBuilder
  | SeparatorBuilder
  | ActionRowBuilder<ButtonBuilder>
  | ActionRowBuilder<StringSelectMenuBuilder>
  | ActionRowBuilder<UserSelectMenuBuilder>;

/**
 * A component that can stand on its own as a top-level entry in a message (a
 * sibling of a container), letting a response mix containers, action rows,
 * sections, text and separators in any order.
 */
export interface TopLevelComponent {
  /** This component as a discord.js builder, ready to be a top-level message entry. */
  build(): TopLevelComponentBuilder;
}
