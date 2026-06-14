import type { Message } from 'discord.js';
import type { Reminder } from '@/core/persistence/prisma/client.js';
import { InteractiveMessage } from '@/discord/interactions/collector.js';
import {
  buildReminderCancelledContainer,
  buildReminderCreatedContainer,
  parseReminderCancelButtonId,
} from '@/discord/presentations/reminder-presentation.js';
import { cancelReminder } from '@/discord/reminders/reminder-bridge.js';

const CANCEL_WINDOW_MS = 120_000;

interface CancelState {
  reminder: Reminder;
  cancelled: boolean;
}

/**
 * Attaches a "cancel" button collector to a reminder confirmation message,
 * limited to `reminder.userId`. Clicking the button cancels the reminder and
 * stops the collector; after `CANCEL_WINDOW_MS` the button is disabled and
 * the cancel option is no longer available.
 */
export function attachReminderCancelCollector(
  message: Message,
  reminder: Reminder,
): void {
  new InteractiveMessage<CancelState>(
    message,
    { reminder, cancelled: false },
    ({ reminder: r, cancelled }, { disabled }) =>
      cancelled
        ? buildReminderCancelledContainer(r)
        : buildReminderCreatedContainer(r, { disabled }),
    async (interaction, state, stop) => {
      if (
        parseReminderCancelButtonId(interaction.customId) !== state.reminder.id
      ) {
        return state;
      }
      await cancelReminder(state.reminder.id);
      stop();
      return { ...state, cancelled: true };
    },
    { time: CANCEL_WINDOW_MS, allowedIds: [reminder.userId] },
  );
}
