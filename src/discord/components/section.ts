import { SectionBuilder } from 'discord.js';
import type { SectionComponent, TextComponent } from './component.js';
import type { Button } from './button.js';

/** A group of text components with an optional button accessory alongside them. */
export class Section implements SectionComponent {
  public readonly kind = 'section';
  private readonly texts: TextComponent[] = [];
  private accessory?: Button;

  public add(...texts: TextComponent[]): this {
    this.texts.push(...texts);
    return this;
  }

  /** Sets the button shown alongside this section's text. */
  public button(button: Button): this {
    this.accessory = button;
    return this;
  }

  public toBuilder(): SectionBuilder {
    const section = new SectionBuilder();
    for (const text of this.texts) {
      section.addTextDisplayComponents(text.toBuilder());
    }
    if (this.accessory) {
      section.setButtonAccessory(this.accessory.toBuilder());
    }
    return section;
  }
}
