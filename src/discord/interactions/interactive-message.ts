import { MessageFlags } from 'discord.js';
import type {
  ContainerBuilder,
  Message,
  MessageComponentInteraction,
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

/**
 * Send `render(initialState)` to `channel`, then keep it in sync: each allowed
 * interaction runs `reduce` and re-renders via `update`, until `stop()` or the
 * idle timeout, after which a single disabled render is applied. Every Discord
 * call is best-effort, so a transient failure never crashes the process.
 *
 * @returns the mounted message, or `undefined` if the initial send failed.
 */
export async function mountInteractiveMessage<State>(
  channel: SendableChannels,
  controller: InteractiveMessage<State>,
): Promise<Message | undefined> {
  let state = controller.initialState;

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

  return message;
}
