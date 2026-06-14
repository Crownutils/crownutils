import type {
  CollectedInteraction,
  Message,
  ReadonlyCollection,
} from 'discord.js';
import { buildErrorContainer } from '../errors.js';
import { lang } from '../lang/index.js';
import type { Container } from '../components/index.js';

type CollectorCollectHandler = (
  interaction: CollectedInteraction,
) => Promise<void> | void;
type CollectorEndHandler = (
  collected: ReadonlyCollection<string, CollectedInteraction>,
  reason: string,
) => void;

interface CollectorOptions {
  idle?: number;
  time?: number;
  onCollect: CollectorCollectHandler;
  onEnd?: CollectorEndHandler;
}

class Collector {
  private readonly collector;

  public constructor(message: Message, options: CollectorOptions) {
    this.collector = message.createMessageComponentCollector({
      idle: options.idle,
      time: options.time,
    });

    this.collector.on('collect', (i) => void options.onCollect(i));

    if (options.onEnd) {
      const onEnd = options.onEnd;
      this.collector.on('end', (c, r) => onEnd(c, r));
    }
  }

  public stop(reason?: string): void {
    this.collector.stop(reason);
  }
}

type Render<S> = (state: S, ctx: { disabled: boolean }) => Container;
type Reduce<S> = (
  interaction: CollectedInteraction,
  state: S,
  stop: () => void,
) => Promise<S> | S;

/**
 * Drives a Components V2 message that re-renders on each interaction.
 *
 * `reduce` updates state and `render` rebuilds the container from it —
 * the message is edited in place on every collected interaction until
 * `stop()` is called from within `reduce`, after which it's re-rendered
 * once more with `disabled: true`.
 */
export class InteractiveMessage<S> {
  private state: S;
  private finished = false;
  private readonly collector: Collector;
  private readonly allowedIds: string[];

  /**
   * @param options.allowedIds - User ids allowed to interact with the
   * message. Other users get an ephemeral "not allowed" reply instead of
   * triggering `reduce`/`render`. Pass an empty array to allow everyone.
   */
  public constructor(
    private readonly message: Message,
    initial: S,
    private readonly render: Render<S>,
    private readonly reduce: Reduce<S>,
    options: {
      idle?: number;
      time?: number;
      allowedIds: string[];
    },
  ) {
    this.state = initial;
    this.allowedIds = options.allowedIds;

    this.collector = new Collector(message, {
      idle: options.idle,
      time: options.time,
      onCollect: (i) => this.onCollect(i),
      onEnd: () => {
        if (this.finished) {
          return;
        }
        void this.message
          .edit(this.render(this.state, { disabled: true }).build())
          .catch(() => {});
      },
    });
  }

  private async onCollect(interaction: CollectedInteraction) {
    if (
      this.allowedIds.length > 0 &&
      !this.allowedIds.includes(interaction.user.id)
    ) {
      await interaction
        .reply(
          buildErrorContainer(lang.errors.interactionNotAllowed).build({
            ephemeral: true,
          }),
        )
        .catch(() => {});
      return;
    }

    let stopped = false;
    this.state = await this.reduce(interaction, this.state, () => {
      stopped = true;
    });

    if (interaction.isMessageComponent()) {
      await interaction
        .update(this.render(this.state, { disabled: false }).build())
        .catch(() => {});
    }

    if (stopped) {
      this.finished = true;
      this.collector.stop();
    }
  }
}
