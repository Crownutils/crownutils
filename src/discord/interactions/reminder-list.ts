import type { Message } from 'discord.js';
import type { Reminder } from '@/core/persistence/prisma/client.js';
import { lang } from '@/discord/lang/index.js';
import { InteractiveMessage } from '@/discord/interactions/collector.js';
import { buildErrorContainer } from '@/discord/errors.js';
import {
  buildReminderListContainer,
  parseReminderDeleteButtonId,
} from '@/discord/presentations/reminder-presentation.js';
import {
  deleteUserReminder,
  listReminders,
} from '@/discord/reminders/reminder-bridge.js';

const LIST_WINDOW_MS = 120_000;

export function attachReminderListCollector(
  message: Message,
  authorId: string,
  reminders: Reminder[],
): void {
  new InteractiveMessage(
    message,
    reminders,
    (current, { disabled }) =>
      buildReminderListContainer(current, { disabled }),
    async (interaction, current, stop) => {
      const reminderId = parseReminderDeleteButtonId(interaction.customId);
      if (reminderId === null) {
        return current;
      }

      const deleted = await deleteUserReminder(reminderId, authorId);
      if (!deleted) {
        await interaction
          .reply(
            buildErrorContainer(
              lang.commands.reminders.messages.cannotDelete,
            ).build({ ephemeral: true }),
          )
          .catch(() => {});
        return current;
      }

      const remaining = await listReminders(authorId);
      if (remaining.length === 0) {
        stop();
      }
      return remaining;
    },
    { idle: LIST_WINDOW_MS, allowedIds: [authorId] },
  );
}
