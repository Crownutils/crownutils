import { TextDisplayBuilder } from 'discord.js';
import type { TextComponent } from './component.js';

/**
 * A heading component. It is a Text under the hood (kind: 'text')
 * since Discord renders titles as markdown headers inside a
 * TextDisplay — there is no dedicated "title" component in V2.
 */
export class Title implements TextComponent {
  public readonly kind = 'text';

  public constructor(private readonly content: string) {}

  public toBuilder(): TextDisplayBuilder {
    return new TextDisplayBuilder().setContent(`## ${this.content}`);
  }
}
