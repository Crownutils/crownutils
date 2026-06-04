import { SeparatorBuilder } from 'discord.js';
import type { SeparatorComponent } from './component.js';

export class Separator implements SeparatorComponent {
  public readonly kind = 'separator';

  public toBuilder(): SeparatorBuilder {
    return new SeparatorBuilder();
  }
}
