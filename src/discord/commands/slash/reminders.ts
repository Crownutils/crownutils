import { SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import { attachReminderListCollector } from '@/discord/interactions/reminder-list.js';
import { replyAndFetch } from '@/discord/interactions/reply.js';
import { runRemindersCommand } from '@/discord/reminders/reminders-command.js';
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
    const { container, reminders } = await runRemindersCommand(
      interaction.user.id,
    );
    const reply = await replyAndFetch(interaction, container.build());
    attachReminderListCollector(reply, interaction.user.id, reminders);
  },
} satisfies SlashCommand;
