import { ContainerBuilder, MessageFlags } from 'discord.js';
import type { V2Component } from './component.js';

const COLORS = {
  success: 0x57f287,
  error: 0xed4245,
  info: 0x5865f2,
  warning: 0xfee75c,
  cancelled: 0xe74c3c,
} as const;

type ColorName = keyof typeof COLORS;

/**
 * Components V2 message builder. Components are added via `add()` in
 * display order, then `build()` produces the `components`/`flags` payload
 * to pass directly to `reply`/`edit`/`update`.
 */
export class Container {
  private readonly components: V2Component[] = [];
  private accentColor?: number;

  public color(color: ColorName): this {
    this.accentColor = COLORS[color];
    return this;
  }

  public add(...components: V2Component[]): this {
    this.components.push(...components);
    return this;
  }

  /**
   * Builds the `{ components, flags }` payload. `IsComponentsV2` is always
   * set; pass `ephemeral: true` to also set the `Ephemeral` flag.
   */
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
        case 'section':
          container.addSectionComponents(component.toBuilder());
          break;
        case 'action-row':
          container.addActionRowComponents(component.toBuilder());
          break;
        case 'select':
          container.addActionRowComponents(component.toBuilder());
          break;
      }
    }

    const flags = options?.ephemeral
      ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      : MessageFlags.IsComponentsV2;

    return {
      components: [container],
      flags,
    };
  }
}
