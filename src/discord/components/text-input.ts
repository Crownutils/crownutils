import { LabelBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

/** Text-input style: single-line (`short`) or multi-line (`paragraph`). */
export type TextInputStyleName = 'short' | 'paragraph';

const TEXT_INPUT_STYLES = {
  short: TextInputStyle.Short,
  paragraph: TextInputStyle.Paragraph,
} as const satisfies Record<TextInputStyleName, TextInputStyle>;

/**
 * One labelled text field of a {@link Modal}. `customId` identifies the field
 * when reading the submission. Uses the modern label API: the visible label
 * lives on the wrapping `LabelBuilder`, not on the input itself.
 */
export class TextInput {
  private readonly input: TextInputBuilder;
  private labelText: string;
  private descriptionText?: string;

  public constructor(customId: string, label: string) {
    this.labelText = label;
    this.input = new TextInputBuilder()
      .setCustomId(customId)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
  }

  /** Overrides the visible label (also settable via the constructor). */
  public label(label: string): this {
    this.labelText = label;
    return this;
  }

  /** Adds a small hint line under the label. */
  public description(description: string): this {
    this.descriptionText = description;
    return this;
  }

  public style(style: TextInputStyleName): this {
    this.input.setStyle(TEXT_INPUT_STYLES[style]);
    return this;
  }

  /** Shortcut for a multi-line field. */
  public paragraph(): this {
    return this.style('paragraph');
  }

  public required(required = true): this {
    this.input.setRequired(required);
    return this;
  }

  public placeholder(placeholder: string): this {
    this.input.setPlaceholder(placeholder);
    return this;
  }

  /** Pre-fills the field with a default value. */
  public value(value: string): this {
    this.input.setValue(value);
    return this;
  }

  public minLength(min: number): this {
    this.input.setMinLength(min);
    return this;
  }

  public maxLength(max: number): this {
    this.input.setMaxLength(max);
    return this;
  }

  public toBuilder(): LabelBuilder {
    const label = new LabelBuilder()
      .setLabel(this.labelText)
      .setTextInputComponent(this.input);
    if (this.descriptionText !== undefined) {
      label.setDescription(this.descriptionText);
    }
    return label;
  }
}
