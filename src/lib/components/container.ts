import type { TextDisplayBuilder } from 'discord.js';
import { ContainerBuilder, MessageFlags } from 'discord.js';
import type { TextComponent, V2Component } from './component.js';

const COLORS = {
  success: 0x57f287,
  error: 0xed4245,
  info: 0x5865f2,
  warning: 0xfee75c,
} as const;

type ColorName = keyof typeof COLORS;

export class Container {
  private readonly components: V2Component[] = [];
  private accentColor?: number;

  public color(color: ColorName | number): this {
    this.accentColor = typeof color === 'number' ? color : COLORS[color];
    return this;
  }

  public add(...components: V2Component[]): this {
    this.components.push(...components);
    return this;
  }

  public build(options?: { ephemeral?: boolean }): {
    components: ContainerBuilder[];
    flags: number;
  } {
    const container = new ContainerBuilder();
    if (this.accentColor !== undefined) {
      container.setAccentColor(this.accentColor);
    }

    for (const component of this.components) {
      switch (component.kind) {
        case 'text':
          container.addTextDisplayComponents(component.toBuilder());
          break;
        case 'separator':
          container.addSeparatorComponents(component.toBuilder());
          break;
        case 'raw':
          component.apply(container);
          break;
      }
    }

    const flags = options?.ephemeral
      ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      : MessageFlags.IsComponentsV2;

    return {
      components: [container],
      flags: flags,
    };
  }
}

export function render(component: TextComponent): {
  components: TextDisplayBuilder[];
  flags: number;
} {
  return {
    components: [component.toBuilder()],
    flags: MessageFlags.IsComponentsV2,
  };
}
