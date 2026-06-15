import { ModalBuilder } from 'discord.js';
import type { TextInput } from './text-input.js';

/**
 * A modal. `customId` lets the submit handler recognise which
 * modal was sent; add one or more {@link TextInput} fields via `add()`, then
 * pass `build()` straight to `interaction.showModal(...)`.
 */
export class Modal {
  private readonly inputs: TextInput[] = [];

  public constructor(
    private readonly customId: string,
    private readonly title: string,
  ) {}

  public add(...inputs: TextInput[]): this {
    this.inputs.push(...inputs);
    return this;
  }

  public build(): ModalBuilder {
    return new ModalBuilder()
      .setCustomId(this.customId)
      .setTitle(this.title)
      .addLabelComponents(...this.inputs.map((input) => input.toBuilder()));
  }
}
