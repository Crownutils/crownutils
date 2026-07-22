import { ContainerBuilder } from 'discord.js';
import type { ContainerChild } from './component.js';
import type { ColorName } from '../theme/colors.js';
import { colors } from '../theme/colors.js';

/** Fluent wrapper over a Components V2 container (the message body). */
export class Container {
  private readonly builder = new ContainerBuilder();

  public color(color: number | ColorName): this {
    const accentColor = typeof color === 'number' ? color : colors[color];
    this.builder.setAccentColor(accentColor);
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

/** New {@link Container} with its accent color already set. */
export function createContainer(accent: ColorName | number): Container {
  return new Container().color(accent);
}
