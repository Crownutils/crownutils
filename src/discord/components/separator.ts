import { SeparatorBuilder, type SeparatorSpacingSize } from 'discord.js';
import type { ContainerBuilder } from 'discord.js';
import type { ContainerChild } from './component.js';

/** Fluent wrapper over a Components V2 separator. */
export class Separator implements ContainerChild {
  private readonly builder = new SeparatorBuilder();

  public divider(value = true): this {
    this.builder.setDivider(value);
    return this;
  }

  public spacing(size: SeparatorSpacingSize): this {
    this.builder.setSpacing(size);
    return this;
  }

  public attachToContainer(container: ContainerBuilder): void {
    container.addSeparatorComponents(this.builder);
  }

  /** This separator as a top-level message component. */
  public build(): SeparatorBuilder {
    return this.builder;
  }
}
