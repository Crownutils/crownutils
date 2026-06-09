import { ButtonBuilder, ButtonStyle } from 'discord.js';

type ButtonColor = 'primary' | 'secondary' | 'success' | 'danger';

const BUTTON_STYLES: Record<ButtonColor, ButtonStyle> = {
  primary: ButtonStyle.Primary,
  secondary: ButtonStyle.Secondary,
  success: ButtonStyle.Success,
  danger: ButtonStyle.Danger,
};

export class Button {
  private readonly builder: ButtonBuilder;

  public constructor(customId: string) {
    this.builder = new ButtonBuilder().setCustomId(customId);
  }

  public color(color: ButtonColor): this {
    this.builder.setStyle(BUTTON_STYLES[color]);
    return this;
  }

  public emoji(emoji: string): this {
    this.builder.setEmoji({ name: emoji });
    return this;
  }

  public label(label: string): this {
    this.builder.setLabel(label);
    return this;
  }

  public disabled(disabled = true): this {
    this.builder.setDisabled(disabled);
    return this;
  }

  public toBuilder(): ButtonBuilder {
    return this.builder;
  }
}
