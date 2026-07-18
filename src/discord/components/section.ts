import { SectionBuilder } from 'discord.js';
import type { ContainerBuilder } from 'discord.js';
import type { ContainerChild } from './component.js';
import { Text } from './text.js';
import type { Button } from './button.js';

/** Fluent wrapper over a section (text lines plus one accessory). */
export class Section implements ContainerChild {
  private readonly builder = new SectionBuilder();

  public add(...texts: (string | Text)[]): this {
    for (const line of texts) {
      const text = typeof line === 'string' ? new Text(line) : line;
      text.attachToSection(this.builder);
    }
    return this;
  }

  /** Sets the button shown alongside this section's text. */
  public button(button: Button): this {
    this.builder.setButtonAccessory(button.toBuilder());
    return this;
  }

  public attachToContainer(container: ContainerBuilder): void {
    container.addSectionComponents(this.builder);
  }

  /** This section as a top-level message component. */
  public build(): SectionBuilder {
    return this.builder;
  }
}
