import { ButtonBuilder, ButtonStyle } from 'discord.js';
import type { ComponentEmojiResolvable } from 'discord.js';
import type { RowChild } from './component.js';

type ButtonColor = 'primary' | 'secondary' | 'success' | 'danger';

const BUTTON_STYLES: Record<ButtonColor, ButtonStyle> = {
  primary: ButtonStyle.Primary,
  secondary: ButtonStyle.Secondary,
  success: ButtonStyle.Success,
  danger: ButtonStyle.Danger,
};

/** Fluent wrapper over a button. */
export class Button implements RowChild {
  private readonly builder: ButtonBuilder;

  public constructor(customId: string) {
    this.builder = new ButtonBuilder().setCustomId(customId);
  }

  public label(text: string): this {
    this.builder.setLabel(text);
    return this;
  }

  public color(style: ButtonColor): this {
    this.builder.setStyle(BUTTON_STYLES[style]);
    return this;
  }

  public emoji(emoji: ComponentEmojiResolvable): this {
    this.builder.setEmoji(emoji);
    return this;
  }

  public link(url: string): this {
    this.builder.setStyle(ButtonStyle.Link).setURL(url);
    return this;
  }

  public disabled(value = true): this {
    this.builder.setDisabled(value);
    return this;
  }

  public toBuilder(): ButtonBuilder {
    return this.builder;
  }
}
