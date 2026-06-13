import type { Message } from 'discord.js';
import type { Reminder } from '@/core/persistence/prisma/client.js';
import { InteractiveMessage } from '@/discord/interactions/collector.js';
import {
  buildReminderCancelledContainer,
  buildReminderCreatedContainer,
} from '@/discord/presentations/reminder-presentation.js';
import { cancelReminder } from '@/discord/reminders/reminder-bridge.js';

const CANCEL_WINDOW_MS = 120_000;

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
  new InteractiveMessage(
    message,
    reminder,
    (r, { disabled }) =>
      disabled
        ? buildReminderCreatedContainer(r, { disabled })
        : buildReminderCancelledContainer(r),
    async (_i, r, stop) => {
      await cancelReminder(r.id);
      stop();
      return r;
    },
    { time: CANCEL_WINDOW_MS, allowedIds: [reminder.userId] },
  );
}
