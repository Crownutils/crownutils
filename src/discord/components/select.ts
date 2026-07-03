import { StringSelectMenuBuilder } from 'discord.js';
import type { RowChild } from './component.js';

/** One option of a {@link SelectMenu}. */
export interface SelectOption {
  readonly label: string;
  readonly value: string;
  readonly description?: string;
  readonly default?: boolean;
}

/** Fluent wrapper over a string select menu. */
export class SelectMenu implements RowChild {
  private readonly builder: StringSelectMenuBuilder;

  public constructor(customId: string) {
    this.builder = new StringSelectMenuBuilder().setCustomId(customId);
  }

  public placeholder(text: string): this {
    this.builder.setPlaceholder(text);
    return this;
  }

  public options(options: readonly SelectOption[]): this {
    this.builder.setOptions(
      options.map((option) => ({
        label: option.label,
        value: option.value,
        ...(option.description !== undefined && {
          description: option.description,
        }),
        ...(option.default !== undefined && { default: option.default }),
      })),
    );

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

  public toBuilder(): StringSelectMenuBuilder {
    return this.builder;
  }
}
