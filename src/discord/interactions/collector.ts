import type {
  CollectedInteraction,
  CollectorFilter,
  Message,
  ReadonlyCollection,
} from 'discord.js';
import type { Container } from '../components/index.js';

type CollectorIdleTimeoutMs = number;
type CollectorTimeoutMs = number;
type CollectorCollectHandler = (
  interaction: CollectedInteraction,
) => Promise<void> | void;
type CollectorEndHandler = (
  collected: ReadonlyCollection<string, CollectedInteraction>,
  reason: string,
) => void;

interface CollectorOptions {
  idle?: CollectorIdleTimeoutMs;
  time?: CollectorTimeoutMs;
  filter?: CollectorFilter<[CollectedInteraction]>;
  onCollect: CollectorCollectHandler;
  onEnd?: CollectorEndHandler;
}

class Collector {
  private readonly collector;

  public constructor(message: Message, options: CollectorOptions) {
    this.collector = message.createMessageComponentCollector({
      idle: options.idle,
      time: options.time,
      filter: options.filter,
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

export class InteractiveMessage<S> {
  private state: S;
  private finished = false;
  private readonly collector: Collector;

  public constructor(
    private readonly message: Message,
    initial: S,
    private readonly render: Render<S>,
    private readonly reduce: Reduce<S>,
    options: {
      idle?: CollectorIdleTimeoutMs;
      time?: CollectorTimeoutMs;
      allowedIds: string[];
    },
  ) {
    this.state = initial;

    this.collector = new Collector(message, {
      idle: options.idle,
      time: options.time,
      filter:
        options.allowedIds.length === 0
          ? undefined
          : (i) => options.allowedIds!.includes(i.user.id),
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
