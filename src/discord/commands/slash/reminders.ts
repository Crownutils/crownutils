import { SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import { buildReminderListContainer } from '@/discord/presentations/reminder-presentation.js';
import { attachReminderListCollector } from '@/discord/interactions/reminder-list.js';
import { replyAndFetch } from '@/discord/interactions/reply.js';
import { listReminders } from '@/discord/reminders/reminder-bridge.js';
import type { SlashCommand } from '@/discord/types/command.js';

/** `/reminders`: lists the caller's reminders with delete buttons. */
export const command = {
  data: new SlashCommandBuilder()
    .setName('reminders')
    .setDescription(lang.commands.reminders.commandDescription),
  requirements: {
    scope: 'global',
  },
  help: {
    usageSlash: '/reminders',
  },

  async execute(interaction) {
    const reminders = await listReminders(interaction.user.id);
    const reply = await replyAndFetch(
      interaction,
      buildReminderListContainer(reminders).build(),
    );
    attachReminderListCollector(reply, interaction.user.id, reminders);
  },
} satisfies SlashCommand;
