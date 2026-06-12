import { ActionRowBuilder } from 'discord.js';
import type { ButtonBuilder } from 'discord.js';
import type { ActionRowComponent } from './component.js';
import type { Button } from './button.js';

export class ActionRow implements ActionRowComponent {
  public readonly kind = 'action-row';
  private readonly buttons: Button[];

  public constructor(...buttons: Button[]) {
    this.buttons = buttons;
  }

  public toBuilder(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...this.buttons.map((button) => button.toBuilder()),
    );
  }
}
