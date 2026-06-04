import { TextDisplayBuilder } from 'discord.js';
import type { TextComponent } from './component.js';

/**
 * A footer-like component: small, subtle text (markdown "-#").
 * V2 has no real footer field, so this is a Text under the hood
 * (kind: 'text') rendered with the subtle "-#" markdown.
 */
export class Footer implements TextComponent {
  public readonly kind = 'text';

  public constructor(private readonly content: string) {}

  public toBuilder(): TextDisplayBuilder {
    return new TextDisplayBuilder().setContent(`-# ${this.content}`);
  }
}
