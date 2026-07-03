import { ContainerBuilder } from 'discord.js';
import type { ContainerChild } from './component.js';

/** Fluent wrapper over a Components V2 container (the message body). */
export class Container {
  private readonly builder = new ContainerBuilder();

  public color(color: number): this {
    this.builder.setAccentColor(color);
    return this;
  }

  public add(...children: ContainerChild[]): this {
    for (const child of children) {
      child.attachToContainer(this.builder);
    }
    return this;
  }

  public build(): ContainerBuilder {
    return this.builder;
  }
}
