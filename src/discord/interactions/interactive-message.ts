import { MessageFlags } from 'discord.js';
import type {
  Message,
  MessageComponentInteraction,
  ModalBuilder,
  ModalMessageModalSubmitInteraction,
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

/**
 * Folds a modal submission into the next state. Runs as its own transition
 * against the latest `state`, so a slow modal never clobbers a newer click.
 */
export type ModalApply<State> = (
  state: State,
  submit: ModalMessageModalSubmitInteraction,
  context: ReduceContext<State>,
) => State | Promise<State>;

/** Lifecycle controls a {@link InteractiveMessage.reduce} may trigger. */
export interface ReduceContext<State> {
  /** End collection now; the message is re-rendered once more as disabled. */
  stop(): void;
  /**
   * Declare the interaction already acknowledged (e.g. `reply`), so the default
   * `update` re-render - which would double-acknowledge - is skipped.
   */
  markHandled(): void;
  /**
   * Show `modal` as this interaction's response, then fold its submission into a
   * fresh state transition via `apply`. The runtime awaits the submission off
   * the transition queue (the message stays responsive) and runs `apply` against
   * the latest state. This acknowledges the interaction, so return the current
   * state unchanged afterwards. `options.time` overrides the idle-length wait.
   */
  showModal(
    modal: ModalBuilder,
    apply: ModalApply<State>,
    options?: { readonly time?: number },
  ): void;
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
    context: ReduceContext<State>,
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

/** Any interaction that can acknowledge by editing the message in place. */
type MessageUpdatable =
  MessageComponentInteraction | ModalMessageModalSubmitInteraction;

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

  /**
   * Every transition (component clicks and deferred modal submissions) reads and
   * writes `state`, so they run one at a time through this queue: an in-flight
   * modal can neither interleave with nor be clobbered by a later click.
   */
  let queue: Promise<void> = Promise.resolve();
  const enqueue = (task: () => Promise<void>): void => {
    // Run `task` on either outcome, and swallow its rejection so the chain lives on.
    queue = queue.then(task, task).catch(() => undefined);
  };

  const payload = (disabled: boolean) => ({
    flags: MessageFlags.IsComponentsV2 as const,
    components: componentsOf(controller, state, disabled),
  });

  /** Re-render through `interaction` unless the reducer already answered it; end collection when stopping. */
  const rerender = async (
    interaction: MessageUpdatable,
    handled: boolean,
    stopped: boolean,
  ): Promise<void> => {
    if (!handled && !interaction.replied && !interaction.deferred) {
      await safeDiscord(interaction.update(payload(stopped)), {
        action: 'interactiveUpdate',
      });
      if (stopped) disabledRendered = true;
    }
    // Tagged so the end handler skips its own re-render over this one.
    if (stopped) collector.stop(STOP_REASON);
  };

  /** Show a reducer's modal and, once submitted, enqueue its follow-up transition. */
  const openModal = (
    interaction: MessageComponentInteraction,
    modal: ModalBuilder,
    apply: ModalApply<State>,
    time: number,
  ): void => {
    void (async () => {
      await safeDiscord(interaction.showModal(modal), {
        action: 'interactiveShowModal',
      });
      const submit = await interaction
        .awaitModalSubmit({
          time,
          filter: (i) =>
            i.customId === modal.toJSON().custom_id &&
            i.user.id === interaction.user.id,
        })
        .catch(() => undefined);
      if (submit === undefined || !submit.isFromMessage()) return;
      enqueue(() =>
        runTransition(submit, (context) => apply(state, submit, context)),
      );
    })();
  };

  /** The context a reducer receives, wired to this interaction's transition flags. */
  const makeContext = (
    interaction: MessageUpdatable,
    flags: { handled: boolean; stopped: boolean },
  ): ReduceContext<State> => ({
    stop: () => {
      flags.stopped = true;
    },
    markHandled: () => {
      flags.handled = true;
    },
    showModal: (modal, apply, options) => {
      // showModal is the interaction's own acknowledgement.
      flags.handled = true;
      openModal(
        interaction as MessageComponentInteraction,
        modal,
        apply,
        options?.time ?? controller.idleMs ?? INTERACTIVE_MESSAGE_IDLE_MS,
      );
    },
  });

  /** Run one reducer against the latest state, apply its result, then re-render. */
  const runTransition = async (
    interaction: MessageUpdatable,
    reduce: (context: ReduceContext<State>) => State | Promise<State>,
  ): Promise<void> => {
    const flags = { handled: false, stopped: false };
    state = await reduce(makeContext(interaction, flags));
    await rerender(interaction, flags.handled, flags.stopped);
  };

  collector.on('ignore', (interaction) => {
    void refuse(interaction);
  });

  collector.on('collect', (interaction) => {
    enqueue(() =>
      runTransition(interaction, (context) =>
        controller.reduce(state, interaction, context),
      ),
    );
  });

  collector.on('end', (_collected, reason) => {
    // Skip only if an explicit stop already rendered the disabled state.
    if (reason === STOP_REASON && disabledRendered) return;
    // Run after any in-flight transition so the final render reflects the latest state.
    enqueue(async () => {
      await safeDiscord(message.edit(payload(true)), {
        action: 'interactiveTimeout',
      });
    });
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
