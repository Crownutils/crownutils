import { SeparatorBuilder } from 'discord.js';
import type { SeparatorComponent } from './component.js';

/** A horizontal divider between components. */
export class Separator implements SeparatorComponent {
  public readonly kind = 'separator';

  public toBuilder(): SeparatorBuilder {
    return new SeparatorBuilder();
  }
}
