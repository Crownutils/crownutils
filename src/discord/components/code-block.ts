import { TextDisplayBuilder } from 'discord.js';
import type { TextComponent } from './component.js';

/** A fenced code block, rendered as ` ```language\ncontent\n``` `. */
export class CodeBlock implements TextComponent {
  public readonly kind = 'text';

  public constructor(
    private readonly content: string,
    private readonly language = '',
  ) {}

  public toBuilder(): TextDisplayBuilder {
    return new TextDisplayBuilder().setContent(
      `\`\`\`${this.language}\n${this.content}\n\`\`\``,
    );
  }
}
