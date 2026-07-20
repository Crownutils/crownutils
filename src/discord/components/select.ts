import {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  UserSelectMenuBuilder,
} from 'discord.js';
import type { ComponentEmojiResolvable } from 'discord.js';
import type { RowChild } from './component.js';

/** One option of a {@link SelectMenu}. */
export interface SelectOption {
  readonly label: string;
  readonly value: string;
  readonly description?: string;
  readonly default?: boolean;
  /** Leading emoji (unicode or custom) shown before the label. */
  readonly emoji?: ComponentEmojiResolvable;
}

/** Shared fluent setters every select menu builder supports, regardless of kind. */
abstract class BaseSelectMenu<
  T extends StringSelectMenuBuilder | UserSelectMenuBuilder,
> implements RowChild {
  protected constructor(protected readonly builder: T) {}

  public placeholder(text: string): this {
    this.builder.setPlaceholder(text);
    return this;
  }

  public min(value: number): this {
    this.builder.setMinValues(value);
    return this;
  }

  public max(value: number): this {
    this.builder.setMaxValues(value);
    return this;
  }

  public disabled(value = true): this {
    this.builder.setDisabled(value);
    return this;
  }

  public toBuilder(): T {
    return this.builder;
  }
}

/** Fluent wrapper over a string select menu. */
export class SelectMenu extends BaseSelectMenu<StringSelectMenuBuilder> {
  public constructor(customId: string) {
    super(new StringSelectMenuBuilder().setCustomId(customId));
  }

  public options(options: readonly SelectOption[]): this {
    this.builder.setOptions(
      options.map((option) => {
        const builder = new StringSelectMenuOptionBuilder()
          .setLabel(option.label)
          .setValue(option.value);
        if (option.description !== undefined) {
          builder.setDescription(option.description);
        }
        if (option.default !== undefined) builder.setDefault(option.default);
        if (option.emoji !== undefined) builder.setEmoji(option.emoji);
        return builder;
      }),
    );

    return this;
  }
}

/** Fluent wrapper over a user select menu. */
export class UserSelectMenu extends BaseSelectMenu<UserSelectMenuBuilder> {
  public constructor(customId: string) {
    super(new UserSelectMenuBuilder().setCustomId(customId));
  }
}
