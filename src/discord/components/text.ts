import { TextDisplayBuilder } from 'discord.js';
import type { TextComponent } from './component.js';
import { md } from '../markdown.js';

/** `subtle` renders as a small, dimmed line; the others map to Markdown headings. */
export type TextSize = 'normal' | 'subtle' | 'small' | 'medium' | 'large';

const SIZE_PREFIX = {
  normal: '',
  subtle: '-#',
  small: '###',
  medium: '##',
  large: '#',
} as const satisfies Record<TextSize, string>;

/**
 * A text display component. Formatting methods (`bold`, `italic`, `code`,
 * etc.) only affect the first line; use `newLine()` to add further lines,
 * each rendered with its own formatting. `quote()` applies `> ` to every
 * line of the final content, including lines added via `newLine()`.
 */
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

  /** Prefixes every line of the rendered content with `> ` (blockquote). */
  public quote(): this {
    this.isQuote = true;
    return this;
  }

  /**
   * Appends another line below the current content. Pass a `Text` instance
   * to apply its own formatting (bold, code, etc.) independently.
   */
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
      content = md.quote(content);
    }
    return new TextDisplayBuilder().setContent(content);
  }

  private renderLine(): string {
    let text = this.content;
    if (this.isCode) text = md.code(text);
    if (this.isBold) text = md.bold(text);
    if (this.isItalic) text = md.italic(text);
    if (this.isUnderline) text = md.underline(text);
    if (this.isStrikethrough) text = md.strikethrough(text);
    if (this.linkUrl !== undefined) text = md.link(text, this.linkUrl);

    const prefix = SIZE_PREFIX[this.textSize];
    return prefix ? `${prefix} ${text}` : text;
  }
}
