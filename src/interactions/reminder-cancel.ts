import { ComponentType } from 'discord.js';
import type { ButtonInteraction, Message } from 'discord.js';
import type { Reminder } from '@/generated/prisma/client.js';
import { lang } from '@/lang/index.js';
import { buildErrorContainer } from '@/lib/errors.js';
import {
  buildReminderCancelledContainer,
  buildReminderCreatedContainer,
  parseReminderCancelButtonId,
} from '@/services/presentations/reminder-presentation.js';
import { cancelReminder } from '@/services/reminder-service.js';

const CANCEL_WINDOW_MS = 120_000;

export function attachReminderCancelCollector(
  message: Message,
  reminder: Reminder,
): void {
  const remaining = reminder.triggerAt.getTime() - Date.now();
  const time = Math.min(CANCEL_WINDOW_MS, Math.max(0, remaining));

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time,
  });

  async function onCollect(interaction: ButtonInteraction): Promise<void> {
    if (parseReminderCancelButtonId(interaction.customId) !== reminder.id) {
      return;
    }
    if (interaction.user.id !== reminder.userId) {
      await interaction
        .reply(
          buildErrorContainer(lang.reminder.messages.list.notAuthor).build({
            ephemeral: true,
          }),
        )
        .catch(() => {});
      return;
    }
    await cancelReminder(reminder.id);
    await interaction
      .update(buildReminderCancelledContainer(reminder).build())
      .catch(() => {});
    collector.stop('cancelled');
  }

  collector.on('collect', (interaction) => void onCollect(interaction));

  collector.on('end', (_collected, reason) => {
    if (reason === 'cancelled') {
      return;
    }
    void message
      .edit(buildReminderCreatedContainer(reminder, { disabled: true }).build())
      .catch(() => {});
  });
}
