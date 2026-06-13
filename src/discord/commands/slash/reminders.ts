import { SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import { buildReminderListContainer } from '@/discord/presentations/reminder-presentation.js';
import { attachReminderListCollector } from '@/discord/interactions/reminder-list.js';
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
    await interaction.reply(buildReminderListContainer(reminders).build());
    const reply = await interaction.fetchReply();
    attachReminderListCollector(reply, interaction.user.id, reminders);
  },
} satisfies SlashCommand;
