import {
  LabelBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

/** Text input layout: single-line (`short`) or multi-line (`paragraph`). */
export type TextInputStyleName = 'short' | 'paragraph';

const TEXT_INPUT_STYLES = {
  short: TextInputStyle.Short,
  paragraph: TextInputStyle.Paragraph,
} as const satisfies Record<TextInputStyleName, TextInputStyle>;

/**
 * Fluent wrapper over one modal field. `toBuilder()` yields a `LabelBuilder`
 * wrapping the input: the modern modal API puts the label on the label, not on
 * the input (whose `setLabel` is deprecated).
 */
export class TextInput {
  private readonly builder: TextInputBuilder;
  private labelText: string;
  private descriptionText?: string;

  public constructor(customId: string, label: string) {
    this.labelText = label;
    this.builder = new TextInputBuilder()
      .setCustomId(customId)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
  }

  public label(text: string): this {
    this.labelText = text;
    return this;
  }

  /** Adds a hint line under the label. */
  public description(text: string): this {
    this.descriptionText = text;
    return this;
  }

  public style(style: TextInputStyleName): this {
    this.builder.setStyle(TEXT_INPUT_STYLES[style]);
    return this;
  }

  /** Shortcut for a multi-line input. */
  public paragraph(): this {
    return this.style('paragraph');
  }

  public placeholder(text: string): this {
    this.builder.setPlaceholder(text);
    return this;
  }

  /** Pre-fills the field with a default value. */
  public value(text: string): this {
    this.builder.setValue(text);
    return this;
  }

  public required(value = true): this {
    this.builder.setRequired(value);
    return this;
  }

  public minLength(length: number): this {
    this.builder.setMinLength(length);
    return this;
  }

  public maxLength(length: number): this {
    this.builder.setMaxLength(length);
    return this;
  }

  public toBuilder(): LabelBuilder {
    const label = new LabelBuilder()
      .setLabel(this.labelText)
      .setTextInputComponent(this.builder);
    if (this.descriptionText !== undefined) {
      label.setDescription(this.descriptionText);
    }
    return label;
  }
}

/** Fluent wrapper over a modal. */
export class Modal {
  private readonly builder: ModalBuilder;

  public constructor(customId: string) {
    this.builder = new ModalBuilder().setCustomId(customId);
  }

  public title(text: string): this {
    this.builder.setTitle(text);
    return this;
  }

  public add(...inputs: TextInput[]): this {
    this.builder.addLabelComponents(
      ...inputs.map((input) => input.toBuilder()),
    );
    return this;
  }

  public build(): ModalBuilder {
    return this.builder;
  }
}
