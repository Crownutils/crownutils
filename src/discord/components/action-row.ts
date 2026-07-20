import type {
  ButtonBuilder,
  ContainerBuilder,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
} from 'discord.js';
import { ActionRowBuilder } from 'discord.js';
import type { ContainerChild } from './component.js';
import type { Button } from './button.js';
import type { SelectMenu, UserSelectMenu } from './select.js';

/** Fluent wrapper over an action row holding buttons or a select menu. */
abstract class ActionRow<
  T extends ButtonBuilder | StringSelectMenuBuilder | UserSelectMenuBuilder,
> implements ContainerChild {
  abstract readonly builder: ActionRowBuilder<T>;

  attachToContainer(container: ContainerBuilder): void {
    container.addActionRowComponents(this.builder);
  }

  /** This action row as a top-level message component (rendered outside/below a container). */
  build(): ActionRowBuilder<T> {
    return this.builder;
  }
}

/** Wrapper over an action row, only holding buttons. */
export class ButtonActionRow extends ActionRow<ButtonBuilder> {
  override builder = new ActionRowBuilder<ButtonBuilder>();

  public add(...buttons: readonly Button[]): this {
    this.builder.addComponents(...buttons.map((b) => b.toBuilder()));
    return this;
  }
}

/** Wrapper over an action row, only holding a select menu. */
export class SelectActionRow extends ActionRow<StringSelectMenuBuilder> {
  override builder = new ActionRowBuilder<StringSelectMenuBuilder>();

  public set(menu: SelectMenu): this {
    this.builder.addComponents(menu.toBuilder());
    return this;
  }
}

/** Wrapper over an action row, only holding a user select menu. */
export class UserSelectActionRow extends ActionRow<UserSelectMenuBuilder> {
  override builder = new ActionRowBuilder<UserSelectMenuBuilder>();

  public set(menu: UserSelectMenu): this {
    this.builder.addComponents(menu.toBuilder());
    return this;
  }
}
