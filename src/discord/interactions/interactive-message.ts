import { MessageFlags } from 'discord.js';
import type {
  ContainerBuilder,
  Message,
  MessageComponentInteraction,
  RepliableInteraction,
  SendableChannels,
} from 'discord.js';
import type { Container } from '@/discord/components/index.js';
import { INTERACTIVE_MESSAGE_IDLE_MS } from '@/discord/constants.js';
import { lang } from '@/discord/lang/index.js';
import { resolveUserLocale } from '@/discord/locale.js';
import { safeDiscord } from './safe-discord.js';

/** Collector end reason marking a deliberate `stop()`, told apart from a timeout. */
const STOP_REASON = 'controller-stop';

/** Passed to {@link InteractiveMessage.render}. */
export interface RenderContext {
  /** True for the final render, once the message no longer collects interactions. */
  readonly disabled: boolean;
}

/** Lifecycle controls a {@link InteractiveMessage.reduce} may trigger. */
export interface ReduceContext {
  /** End collection now; the message is re-rendered once more as disabled. */
  stop(): void;
  /**
   * Declare the interaction already acknowledged (e.g. `reply`, `showModal`), so
   * the default `update` re-render - which would double-acknowledge - is skipped.
   */
  markHandled(): void;
}

/**
 * Declarative definition of a self-updating Components V2 message: `render`
 * projects state to a container, `reduce` maps an interaction to the next state.
 * The runtime ({@link mountInteractiveMessage}) owns sending, collecting and editing.
 */
export interface InteractiveMessage<State> {
  readonly initialState: State;
  /** Build the container for a state; disable its interactive parts when `context.disabled`. */
  render(state: State, context: RenderContext): Container;
  /** Compute the next state from a collected component interaction. */
  reduce(
    state: State,
    interaction: MessageComponentInteraction,
    context: ReduceContext,
  ): State | Promise<State>;
  /**
   * User ids allowed to interact; others get an ephemeral, localized refusal and
   * never reach `reduce`. Omit or leave empty to allow everyone.
   */
  readonly allowedIds?: readonly string[];
  /** Idle timeout in ms; defaults to {@link INTERACTIVE_MESSAGE_IDLE_MS}. */
  readonly idleMs?: number;
}

function componentsOf<State>(
  controller: InteractiveMessage<State>,
  state: State,
  disabled: boolean,
): ContainerBuilder[] {
  return [controller.render(state, { disabled }).build()];
}

function isAllowed(
  allowedIds: readonly string[] | undefined,
  userId: string,
): boolean {
  return (
    allowedIds === undefined ||
    allowedIds.length === 0 ||
    allowedIds.includes(userId)
  );
}

async function refuse(interaction: MessageComponentInteraction): Promise<void> {
  const locale = await resolveUserLocale(interaction.user.id);
  await safeDiscord(
    interaction.reply({
      content: lang[locale].common.interactionNotAllowed,
      flags: MessageFlags.Ephemeral,
    }),
    { action: 'interactiveRefused' },
  );
}

/** Attach the collector loop that keeps `message` in sync until stop or timeout. */
function drive<State>(
  message: Message,
  controller: InteractiveMessage<State>,
  initialState: State,
): void {
  let state = initialState;

  const collector = message.createMessageComponentCollector({
    idle: controller.idleMs ?? INTERACTIVE_MESSAGE_IDLE_MS,
  });

  collector.on('collect', (interaction) => {
    // Collector callbacks are synchronous; run the async transition detached.
    void (async () => {
      if (!isAllowed(controller.allowedIds, interaction.user.id)) {
        await refuse(interaction);
        return;
      }

      let stopped = false;
      let handled = false;
      state = await controller.reduce(state, interaction, {
        stop: () => {
          stopped = true;
        },
        markHandled: () => {
          handled = true;
        },
      });

      // Re-render the next state (disabled when stopping) unless reduce already answered it.
      if (!handled && !interaction.replied && !interaction.deferred) {
        await safeDiscord(
          interaction.update({
            flags: MessageFlags.IsComponentsV2,
            components: componentsOf(controller, state, stopped),
          }),
          { action: 'interactiveUpdate' },
        );
      }

      // Tagged so the end handler skips its own re-render over this one.
      if (stopped) collector.stop(STOP_REASON);
    })();
  });

  collector.on('end', (_collected, reason) => {
    // Only the idle timeout finalizes here; an explicit stop already did.
    if (reason === STOP_REASON) return;
    void safeDiscord(
      message.edit({
        flags: MessageFlags.IsComponentsV2,
        components: componentsOf(controller, state, true),
      }),
      { action: 'interactiveTimeout' },
    );
  });
}

/**
 * Post `render(initialState)` in `channel` and keep it in sync: each allowed
 * interaction runs `reduce` and re-renders, until `stop()` or the idle timeout,
 * after which one disabled render is applied. Every Discord call is best-effort.
 *
 * @returns the mounted message, or `undefined` if the initial send failed.
 */
export async function mountInteractiveMessage<State>(
  channel: SendableChannels,
  controller: InteractiveMessage<State>,
): Promise<Message | undefined> {
  const state = controller.initialState;

  const message = await safeDiscord<Message>(
    // Collapse the `SendableChannels` union's `send` overloads to one Promise.
    (async () =>
      channel.send({
        flags: MessageFlags.IsComponentsV2,
        components: componentsOf(controller, state, false),
      }))(),
    { action: 'interactiveSend' },
  );
  if (!message) return undefined;

  drive(message, controller, state);
  return message;
}

/**
 * Like {@link mountInteractiveMessage}, but reply to `interaction` instead of
 * posting in a channel. The reply is public (not ephemeral) so the timeout
 * re-render can still edit it.
 *
 * @returns the reply message, or `undefined` if the reply failed.
 */
export async function mountInteractiveReply<State>(
  interaction: RepliableInteraction,
  controller: InteractiveMessage<State>,
): Promise<Message | undefined> {
  const state = controller.initialState;

  const response = await safeDiscord(
    interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: componentsOf(controller, state, false),
      withResponse: true,
    }),
    { action: 'interactiveReply' },
  );
  const message = response?.resource?.message ?? undefined;
  if (!message) return undefined;

  drive(message, controller, state);
  return message;
}
