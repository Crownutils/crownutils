import {
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  TextDisplayBuilder,
} from 'discord.js';

/**
 * Reusable accent colors for containers. Use a name for anything
 * recurring; pass a raw number to .color() for one-off custom colors.
 */
const COLORS = {
  success: 0x57f287,
  error: 0xed4245,
  info: 0x5865f2,
  warning: 0xfee75c,
} as const;

type ColorName = keyof typeof COLORS;

export class MessageBuilder {
  private readonly container = new ContainerBuilder();

  private flagBits: number = MessageFlags.IsComponentsV2;

  public color(color: ColorName | number): this {
    const value = typeof color === 'number' ? color : COLORS[color];
    this.container.setAccentColor(value);
    return this;
  }

  public title(content: string): this {
    this.container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${content}`),
    );
    return this;
  }

  public text(content: string): this {
    this.container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(content),
    );
    return this;
  }

  public separator(): this {
    this.container.addSeparatorComponents(new SeparatorBuilder());
    return this;
  }

  public flags(flag: number): this {
    this.flagBits |= flag;
    return this;
  }

  public ephemeral(): this {
    this.flagBits |= MessageFlags.Ephemeral;
    return this;
  }

  public get raw(): ContainerBuilder {
    return this.container;
  }

  public build(): { components: ContainerBuilder[]; flags: number } {
    return {
      components: [this.container],
      flags: this.flagBits,
    };
  }
}
