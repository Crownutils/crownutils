import { TextDisplayBuilder } from 'discord.js';
import type { TextComponent } from './component.js';

export class Title implements TextComponent {
  public readonly kind = 'text';

  public constructor(private readonly content: string) {}

  public toBuilder(): TextDisplayBuilder {
    return new TextDisplayBuilder().setContent(`## ${this.content}`);
  }
}
