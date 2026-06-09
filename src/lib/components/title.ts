import { TextDisplayBuilder } from 'discord.js';
import type { TextComponent } from './component.js';

export type TitleSize = 'small' | 'medium' | 'large';

const TITLE_PREFIX = {
  small: '###',
  medium: '##',
  large: '#',
} as const satisfies Record<TitleSize, string>;

export class Title implements TextComponent {
  public readonly kind = 'text';

  public constructor(
    private readonly content: string,
    private readonly size: TitleSize = 'medium',
  ) {}

  public toBuilder(): TextDisplayBuilder {
    return new TextDisplayBuilder().setContent(
      `${TITLE_PREFIX[this.size]} ${this.content}`,
    );
  }
}
