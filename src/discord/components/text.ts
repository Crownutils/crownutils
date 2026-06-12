import { TextDisplayBuilder } from 'discord.js';
import type { TextComponent } from './component.js';

export type TextSize = 'normal' | 'subtle' | 'small' | 'medium' | 'large';

const SIZE_PREFIX = {
  normal: '',
  subtle: '-#',
  small: '###',
  medium: '##',
  large: '#',
} as const satisfies Record<TextSize, string>;

export class Text implements TextComponent {
  public readonly kind = 'text';

  private textSize: TextSize = 'normal';
  private isBold = false;
  private isItalic = false;
  private isUnderline = false;
  private isStrikethrough = false;
  private isCode = false;
  private linkUrl?: string;
  private isQuote = false;
  private readonly nextLines: Text[] = [];

  public constructor(private readonly content: string) {}

  public size(size: TextSize): this {
    this.textSize = size;
    return this;
  }

  public bold(): this {
    this.isBold = true;
    return this;
  }

  public italic(): this {
    this.isItalic = true;
    return this;
  }

  public underline(): this {
    this.isUnderline = true;
    return this;
  }

  public strikethrough(): this {
    this.isStrikethrough = true;
    return this;
  }

  public code(): this {
    this.isCode = true;
    return this;
  }

  public link(url: string): this {
    this.linkUrl = url;
    return this;
  }

  public quote(): this {
    this.isQuote = true;
    return this;
  }

  public newLine(line: string | Text = ''): this {
    this.nextLines.push(line instanceof Text ? line : new Text(line));
    return this;
  }

  public toBuilder(): TextDisplayBuilder {
    const lines = [
      this.renderLine(),
      ...this.nextLines.map((line) => line.renderLine()),
    ];
    if (lines.length > 1 && lines[0] === '') {
      lines.shift();
    }

    let content = lines.join('\n');
    if (this.isQuote) {
      content = content
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
    }
    return new TextDisplayBuilder().setContent(content);
  }

  private renderLine(): string {
    let text = this.content;
    if (this.isCode) text = `\`${text}\``;
    if (this.isBold) text = `**${text}**`;
    if (this.isItalic) text = `*${text}*`;
    if (this.isUnderline) text = `__${text}__`;
    if (this.isStrikethrough) text = `~~${text}~~`;
    if (this.linkUrl !== undefined) text = `[${text}](${this.linkUrl})`;
    if (this.isQuote) text = `> ${text}`;

    const prefix = SIZE_PREFIX[this.textSize];
    return prefix ? `${prefix} ${text}` : text;
  }
}
