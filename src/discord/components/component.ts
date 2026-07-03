import type {
  ButtonBuilder,
  ContainerBuilder,
  StringSelectMenuBuilder,
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
  toBuilder(): ButtonBuilder | StringSelectMenuBuilder;
}
