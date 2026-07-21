import { MessageFlags } from 'discord.js';
import type {
  Message,
  MessageComponentInteraction,
  RepliableInteraction,
  SendableChannels,
} from 'discord.js';
import {
  Container,
  type TopLevelComponent,
  type TopLevelComponentBuilder,
} from '@/discord/components/index.js';
import { INTERACTIVE_MESSAGE_IDLE_MS } from '@/discord/utils/constants.js';
import { lang } from '@/discord/lang/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
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
  /** Build the message body for a state: a single container, or an ordered list of top-level components. Disable interactive parts when `context.disabled`. */
  render(
    state: State,
    context: RenderContext,
  ): Container | readonly TopLevelComponent[];
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
): TopLevelComponentBuilder[] {
  const body = controller.render(state, { disabled });
  const items = body instanceof Container ? [body] : body;
  return items.map((component) => component.build());
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
  // True once the disabled render actually reached the message.
  let disabledRendered = false;

  const collector = message.createMessageComponentCollector({
    idle: controller.idleMs ?? INTERACTIVE_MESSAGE_IDLE_MS,
    // Disallowed clicks never reach 'collect'.
    filter: (interaction) =>
      isAllowed(controller.allowedIds, interaction.user.id),
  });

  collector.on('ignore', (interaction) => {
    void refuse(interaction);
  });

  collector.on('collect', (interaction) => {
    // Collector callbacks are synchronous; run the async transition detached.
    void (async () => {
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
        if (stopped) disabledRendered = true;
      }

      // Tagged so the end handler skips its own re-render over this one.
      if (stopped) collector.stop(STOP_REASON);
    })();
  });

  collector.on('end', (_collected, reason) => {
    // Skip only if an explicit stop already rendered the disabled state.
    if (reason === STOP_REASON && disabledRendered) return;
    void safeDiscord(
      message.edit({
        flags: MessageFlags.IsComponentsV2,
        components: componentsOf(controller, state, true),
      }),
      { action: 'interactiveTimeout' },
    );
  });
}

/** Attach the self-updating collector to an already-sent `message`; send it yourself when you need custom send options (e.g. `allowedMentions`). */
export function attachInteractiveCollector<State>(
  message: Message,
  controller: InteractiveMessage<State>,
): void {
  drive(message, controller, controller.initialState);
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
 * posting in a channel. Public by default so the idle-timeout re-render can
 * edit it; pass `ephemeral` for a private reply (button clicks still update via
 * the interaction, but the idle-timeout disable render is silently skipped).
 *
 * @returns the reply message, or `undefined` if the reply failed.
 */
export async function mountInteractiveReply<State>(
  interaction: RepliableInteraction,
  controller: InteractiveMessage<State>,
  options?: { readonly ephemeral?: boolean },
): Promise<Message | undefined> {
  const state = controller.initialState;
  const components = componentsOf(controller, state, false);

  /**
   * A deferred interaction (e.g. to pre-load slow data) already has a reply to
   * fill in via editReply; a fresh interaction is answered with reply.
   */
  let message: Message | undefined;
  if (interaction.deferred || interaction.replied) {
    message = await safeDiscord(
      interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components,
      }),
      { action: 'interactiveReply' },
    );
  } else {
    const response = await safeDiscord(
      interaction.reply({
        flags:
          options?.ephemeral === true
            ? [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral]
            : [MessageFlags.IsComponentsV2],
        components,
        withResponse: true,
      }),
      { action: 'interactiveReply' },
    );
    message = response?.resource?.message ?? undefined;
  }
  if (!message) return undefined;

  drive(message, controller, state);
  return message;
}
