import { DiscordAPIError } from 'discord.js';
import type { Client } from 'discord.js';
import type { DueReminder } from '@/core/repositories/index.js';
import { resolveUserLocale } from '../../context/locale.js';
import type { InteractiveMessage } from '../../interactions/index.js';
import {
  attachInteractiveCollector,
  commandResponseFromRender,
  sendResponseToChannel,
} from '../../interactions/index.js';
import { toError } from '../../utils/errors.js';
import { createReminderTriggeredController } from './reminder.service.js';

/** Whether a delivery failure is retryable (`transient`) or permanent (`terminal`). */
export type DeliveryErrorKind = 'terminal' | 'transient';

/** Outcome the scheduler settles on: delivered, or failed with a class and reason. */
export type DeliveryResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly kind: DeliveryErrorKind;
      readonly reason: string;
    };

/** Discord codes that make delivery permanently impossible (channel gone / no access / can't DM). */
const TERMINAL_CODES = new Set<number>([10003, 50001, 50013, 50007, 50278]);

/** A delivery failure tagged for retry-vs-give-up (internal to this module). */
class DeliveryError extends Error {
  public constructor(
    public readonly kind: DeliveryErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'DeliveryError';
  }
}

/** Classifies a raw failure; unknown `DiscordAPIError`s fail closed (terminal). */
export function classifyDeliveryError(error: unknown): DeliveryErrorKind {
  if (error instanceof DiscordAPIError) {
    if (typeof error.code === 'number' && TERMINAL_CODES.has(error.code)) {
      return 'terminal';
    }
    if (error.status === 429 || error.status >= 500) return 'transient';
    return 'terminal';
  }
  return 'transient';
}

/** Where a reminder is sent. Swap this to move channel to DM without touching the scheduler. */
export type ReminderDeliveryTarget = (
  client: Client,
  reminder: DueReminder,
  controller: InteractiveMessage<null>,
) => Promise<void>;

/** Current strategy: post the card in the origin channel (pinging only the author) with a relaunch collector. */
export const deliverToChannel: ReminderDeliveryTarget = async (
  client,
  reminder,
  controller,
) => {
  // isSendable() only narrows the channel type; permission/visibility issues surface from send().
  const channel = await client.channels.fetch(reminder.channelId);
  if (!channel?.isSendable()) {
    throw new DeliveryError(
      'terminal',
      `Channel ${reminder.channelId} is missing or not sendable`,
    );
  }
  const rendered = controller.render(controller.initialState, {
    disabled: false,
  });
  const message = await sendResponseToChannel(
    channel,
    commandResponseFromRender(rendered),
    { allowedMentions: { parse: [], users: [reminder.userId] } },
  );
  attachInteractiveCollector(message, controller);
};

/** Drop-in future strategy: DM the author instead of posting in the channel. */
export const deliverToDm: ReminderDeliveryTarget = async (
  client,
  reminder,
  controller,
) => {
  const dm = await (await client.users.fetch(reminder.userId)).createDM();
  const rendered = controller.render(controller.initialState, {
    disabled: false,
  });
  const message = await sendResponseToChannel(
    dm,
    commandResponseFromRender(rendered),
    { allowedMentions: { parse: [] } },
  );
  attachInteractiveCollector(message, controller);
};

/** Delivers a due reminder; resolves to a {@link DeliveryResult} (never throws). */
export type ReminderDeliverer = (
  reminder: DueReminder,
) => Promise<DeliveryResult>;

/** Builds the production deliverer: render the "DRING" card + relaunch collector, send via `target`, classify failures. */
export function createReminderDeliverer(
  client: Client,
  target: ReminderDeliveryTarget = deliverToChannel,
): ReminderDeliverer {
  return async (reminder) => {
    const locale = await resolveUserLocale(reminder.userId);
    const controller = createReminderTriggeredController(
      {
        userId: reminder.userId,
        channelId: reminder.channelId,
        content: reminder.content,
        durationMs: reminder.durationMs,
      },
      locale,
    );
    try {
      await target(client, reminder, controller);
      return { ok: true };
    } catch (error) {
      const kind =
        error instanceof DeliveryError
          ? error.kind
          : classifyDeliveryError(error);
      return { ok: false, kind, reason: toError(error).message };
    }
  };
}
