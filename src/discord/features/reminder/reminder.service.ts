import type { Rank, SupportedLocale } from '@/core/types.js';
import {
  countActiveReminders,
  createReminder,
  deleteUserReminder,
  getUserRank,
  listActiveReminders,
  MAX_REMINDER_DELAY_YEARS,
  reminderLimitForRank,
  REMINDER_CONTENT_MAX_LENGTH,
  type ActiveReminder,
} from '@/core/repositories/index.js';
import type { Container } from '../../components/index.js';
import type { InteractiveMessage } from '../../interactions/index.js';
import {
  mountInteractiveReply,
  safeDiscord,
  sendResponseToInteraction,
} from '../../interactions/index.js';
import { lang } from '../../lang/index.js';
import { buildErrorContainer } from '../../utils/errors.js';
import { parseDurationMs } from './reminder.duration.js';
import { reminderScheduler } from './reminder.scheduler.js';
import {
  buildReminderCancelledContainer,
  buildReminderCreatedContainer,
  buildReminderListContainer,
  buildReminderTriggeredComponents,
  isReminderRelaunchButton,
  parseReminderCancelButtonId,
  parseReminderDeleteButtonId,
} from './reminder.ui.js';

export interface CreateReminderInput {
  readonly userId: string;
  readonly channelId: string;
  readonly rank: Rank;
  readonly locale: SupportedLocale;
  readonly durationInput: string;
  readonly message: string;
  /** Front-specific "format invalide" wording (prefix vs slash examples). */
  readonly invalidFormatText: string;
}

export type CreateReminderOutcome =
  | { readonly ok: true; readonly reminder: ActiveReminder }
  | { readonly ok: false; readonly container: Container };

/** The facts a triggered card carries, enough to relaunch a reminder identically. */
interface ReminderSpec {
  readonly userId: string;
  readonly channelId: string;
  readonly content: string;
  readonly durationMs: number;
}

/** Horizon + quota check, then persist and re-arm. Shared by create and relaunch. */
async function persistReminder(
  spec: ReminderSpec,
  rank: Rank,
  locale: SupportedLocale,
): Promise<CreateReminderOutcome> {
  const t = lang[locale].commandRemind.messages;

  const now = Date.now();
  const horizon = new Date(now);
  horizon.setFullYear(horizon.getFullYear() + MAX_REMINDER_DELAY_YEARS);
  const dueAt = new Date(now + spec.durationMs);
  if (dueAt > horizon) {
    return { ok: false, container: buildErrorContainer(t.durationTooLong) };
  }

  const limit = reminderLimitForRank(rank);
  if ((await countActiveReminders(spec.userId)) >= limit) {
    return { ok: false, container: buildErrorContainer(t.limitReached(limit)) };
  }

  const reminder = await createReminder({
    userId: spec.userId,
    channelId: spec.channelId,
    content: spec.content,
    dueAt,
    durationMs: spec.durationMs,
  });
  reminderScheduler.notifyChanged();
  return { ok: true, reminder };
}

/** Validates raw command input, then persists via {@link persistReminder}. */
export async function runCreateReminder(
  input: CreateReminderInput,
): Promise<CreateReminderOutcome> {
  const content = input.message.trim();
  const durationMs = parseDurationMs(input.durationInput);

  if (
    durationMs === null ||
    content.length === 0 ||
    content.length > REMINDER_CONTENT_MAX_LENGTH
  ) {
    return {
      ok: false,
      container: buildErrorContainer(input.invalidFormatText),
    };
  }

  return persistReminder(
    {
      userId: input.userId,
      channelId: input.channelId,
      content,
      durationMs,
    },
    input.rank,
    input.locale,
  );
}

/** Confirmation controller: the cancel button deletes the reminder and shows the cancelled card. */
export function createReminderCancelController(
  reminder: ActiveReminder,
  userId: string,
  locale: SupportedLocale,
): InteractiveMessage<{ cancelled: boolean }> {
  return {
    initialState: { cancelled: false },
    allowedIds: [userId],
    render(state, { disabled }) {
      return state.cancelled
        ? buildReminderCancelledContainer(reminder.content, locale)
        : buildReminderCreatedContainer(reminder, locale, { disabled });
    },
    async reduce(state, interaction, context) {
      if (
        !interaction.isButton() ||
        parseReminderCancelButtonId(interaction.customId) !== reminder.id
      ) {
        return state;
      }
      await deleteUserReminder(reminder.id, userId);
      reminderScheduler.notifyChanged();
      context.stop();
      return { cancelled: true };
    },
  };
}

/** List controller: each delete button removes its reminder and re-renders; stops when empty. */
export function createReminderListController(
  reminders: ActiveReminder[],
  userId: string,
  locale: SupportedLocale,
): InteractiveMessage<ActiveReminder[]> {
  return {
    initialState: reminders,
    allowedIds: [userId],
    render(state, { disabled }) {
      return buildReminderListContainer(state, locale, { disabled });
    },
    async reduce(state, interaction, context) {
      if (!interaction.isButton()) return state;
      const id = parseReminderDeleteButtonId(interaction.customId);
      if (id === null) return state;

      if (!(await deleteUserReminder(id, userId))) {
        await safeDiscord(
          sendResponseToInteraction(interaction, {
            container: buildErrorContainer(
              lang[locale].commandReminders.messages.cannotDelete,
            ),
            ephemeral: true,
          }),
          { action: 'reminderCannotDelete' },
        );
        context.markHandled();
        return state;
      }

      reminderScheduler.notifyChanged();
      const remaining = await listActiveReminders(userId);
      if (remaining.length === 0) context.stop();
      return remaining;
    },
  };
}

/**
 * Triggered ("DRING") controller: for the 120s window after firing, the relaunch
 * button re-creates the same reminder (same content and duration), subject to the
 * quota, and replies with the created card.
 */
export function createReminderTriggeredController(
  spec: ReminderSpec,
  locale: SupportedLocale,
): InteractiveMessage<null> {
  return {
    initialState: null,
    allowedIds: [spec.userId],
    render(_state, { disabled }) {
      return buildReminderTriggeredComponents(
        spec.content,
        spec.userId,
        locale,
        {
          disabled,
        },
      );
    },
    async reduce(state, interaction, context) {
      if (
        !interaction.isButton() ||
        !isReminderRelaunchButton(interaction.customId)
      ) {
        return state;
      }
      context.markHandled();

      const rank = await getUserRank(spec.userId);
      const outcome = await persistReminder(spec, rank, locale);
      if (!outcome.ok) {
        await safeDiscord(
          sendResponseToInteraction(interaction, {
            container: outcome.container,
            ephemeral: true,
          }),
          { action: 'reminderRelaunch' },
        );
        return state;
      }

      // Relaunched: stop the collector so its end handler re-renders the button disabled.
      context.stop();
      await mountInteractiveReply(
        interaction,
        createReminderCancelController(outcome.reminder, spec.userId, locale),
      );
      return state;
    },
  };
}
