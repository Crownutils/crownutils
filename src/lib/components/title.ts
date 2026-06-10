import type { TextDisplayBuilder } from 'discord.js';
import type { TextComponent } from './component.js';
import { Text } from './text.js';

export type TitleSize = 'small' | 'medium' | 'large';

export class Title implements TextComponent {
  public readonly kind = 'text';

  public constructor(
    private readonly content: string,
    private readonly size: TitleSize = 'medium',
  ) {}

  public toBuilder(): TextDisplayBuilder {
    return new Text(this.content).size(this.size).toBuilder();
  }
}
