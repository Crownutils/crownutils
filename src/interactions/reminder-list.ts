import { ComponentType } from 'discord.js';
import type { ButtonInteraction, Message } from 'discord.js';
import { lang } from '@/lang/index.js';
import { buildErrorContainer } from '@/lib/errors.js';
import {
  buildReminderListContainer,
  parseReminderDeleteButtonId,
} from '@/lib/reminder-presentation.js';
import {
  deleteUserReminder,
  listReminders,
} from '@/services/reminder-service.js';

const LIST_WINDOW_MS = 120_000;

export function attachReminderListCollector(
  message: Message,
  authorId: string,
): void {
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: LIST_WINDOW_MS,
  });

  async function onCollect(interaction: ButtonInteraction): Promise<void> {
    const parsed = parseReminderDeleteButtonId(interaction.customId);
    if (parsed === null) {
      return;
    }
    if (interaction.user.id !== parsed.authorId) {
      await interaction
        .reply(
          buildErrorContainer(lang.reminder.messages.list.notAuthor).build({
            ephemeral: true,
          }),
        )
        .catch(() => {});
      return;
    }

    const deleted = await deleteUserReminder(
      parsed.reminderId,
      interaction.user.id,
    );
    if (!deleted) {
      await interaction
        .reply(
          buildErrorContainer(lang.reminder.messages.list.cannotDelete).build({
            ephemeral: true,
          }),
        )
        .catch(() => {});
      return;
    }

    const remaining = await listReminders(interaction.user.id);
    await interaction
      .update(buildReminderListContainer(remaining).build())
      .catch(() => {});
  }

  collector.on('collect', (interaction) => void onCollect(interaction));

  collector.on('end', () => {
    void disableList(message, authorId);
  });
}

async function disableList(message: Message, authorId: string): Promise<void> {
  const remaining = await listReminders(authorId);
  await message
    .edit(buildReminderListContainer(remaining, { disabled: true }).build())
    .catch(() => {});
}
