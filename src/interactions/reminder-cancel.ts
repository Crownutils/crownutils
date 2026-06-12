import type { Message } from 'discord.js';
import type { Reminder } from '@/core/persistence/prisma/client.js';
import { InteractiveMessage } from '@/lib/collector.js';
import {
  buildReminderCancelledContainer,
  buildReminderCreatedContainer,
} from '@/services/presentations/reminder-presentation.js';
import { cancelReminder } from '@/discord/reminders/reminder-bridge.js';

const CANCEL_WINDOW_MS = 120_000;

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
