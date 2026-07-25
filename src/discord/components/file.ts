import { FileBuilder } from 'discord.js';
import type { ContainerBuilder } from 'discord.js';
import type { ContainerChild } from './component.js';

/**
 * Fluent wrapper over a Components V2 file component: the downloadable card
 * shown for an attachment sent with the message. A Components V2 message
 * displays an attachment only where a component points at it, so every file a
 * response uploads needs one of these, named exactly as the attachment.
 */
export class FileDisplay implements ContainerChild {
  private readonly builder: FileBuilder;

  public constructor(filename: string) {
    this.builder = new FileBuilder().setURL(`attachment://${filename}`);
  }

  public spoiler(value = true): this {
    this.builder.setSpoiler(value);
    return this;
  }

  public attachToContainer(container: ContainerBuilder): void {
    container.addFileComponents(this.builder);
  }
}
