import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import type { SelectComponent } from './component.js';

/** A string select menu wrapped in its own action row. */
export class Select implements SelectComponent {
  public readonly kind = 'select';
  private readonly builder: StringSelectMenuBuilder;

  public constructor(customId: string) {
    this.builder = new StringSelectMenuBuilder().setCustomId(customId);
  }

  public placeholder(text: string): this {
    this.builder.setPlaceholder(text);
    return this;
  }

  /** Adds one option. `value` must be unique among this select's options. */
  public option(label: string, value: string, description?: string): this {
    this.builder.addOptions({ label, value, description });
    return this;
  }

  public disabled(disabled = true): this {
    this.builder.setDisabled(disabled);
    return this;
  }

  public toBuilder(): ActionRowBuilder<StringSelectMenuBuilder> {
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      this.builder,
    );
  }
}
