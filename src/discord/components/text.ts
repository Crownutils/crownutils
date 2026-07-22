import { TextDisplayBuilder } from 'discord.js';
import type { ContainerBuilder, SectionBuilder } from 'discord.js';
import type { ContainerChild } from './component.js';
import { md } from '../theme/markdown.js';

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
 * Fluent wrapper over a Components V2 text display. Inline formatting (`bold`,
 * `code`, `link`, ...) affects the current line only; `newLine()` appends further
 * lines, each with its own formatting; `quote()` blockquotes the whole result.
 */
export class Text implements ContainerChild {
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

  /** Blockquotes every line of the final content (including `newLine()` lines). */
  public quote(): this {
    this.isQuote = true;
    return this;
  }

  /**
   * Appends a line below the current content. Pass a `{@link Text} to give that line
   * its own formatting.
   */
  public newLine(line: string | Text = ''): this {
    this.nextLines.push(line instanceof Text ? line : new Text(line));
    return this;
  }

  public attachToContainer(container: ContainerBuilder): void {
    container.addTextDisplayComponents(this.toBuilder());
  }

  public attachToSection(section: SectionBuilder): void {
    section.addTextDisplayComponents(this.toBuilder());
  }

  public title(): this {
    this.textSize = 'medium';
    return this;
  }

  /** This text as a top-level message component. */
  public build(): TextDisplayBuilder {
    return this.toBuilder();
  }

  private toBuilder(): TextDisplayBuilder {
    return new TextDisplayBuilder().setContent(this.render());
  }

  private render(): string {
    const lines = [
      this.renderLine(),
      ...this.nextLines.map((line) => line.renderLine()),
    ];
    if (lines.length > 1 && lines[0] === '') {
      lines.shift();
    }
    const content = lines.join('\n');
    return this.isQuote ? md.quote(content) : content;
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
