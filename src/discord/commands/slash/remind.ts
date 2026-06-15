import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import { attachReminderCancelCollector } from '@/discord/interactions/reminder-cancel.js';
import { replyAndFetch } from '@/discord/interactions/reply.js';
import { runRemindCommand } from '@/discord/reminders/remind-command.js';
import { DEFAULT_REMINDER_DURATION } from '@/discord/reminders/reminder-bridge.js';
import type { SlashCommand } from '@/discord/types/command.js';

function getReminderArgs(interaction: ChatInputCommandInteraction): {
  durationInput: string;
  remindMessage: string;
} {
  const timeOption = interaction.options.getString('time');
  const messageOption = interaction.options.getString('message');

  if (!timeOption && !messageOption) {
    return {
      durationInput: DEFAULT_REMINDER_DURATION,
      remindMessage: lang.commands.remind.messages.defaultMessage,
    };
  }

  return {
    durationInput: timeOption ?? '',
    remindMessage: messageOption ?? '',
  };
}

/** `/remind`: creates a reminder. */
export const command = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription(lang.commands.remind.commandDescription)
    .addStringOption((option) =>
      option
        .setName('time')
        .setDescription(lang.commands.remind.options.time)
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription(lang.commands.remind.options.message)
        .setRequired(false),
    ),
  requirements: {
    scope: 'global',
  },
  help: {
    usageSlash: '/remind [time] [message]',
  },

  async execute(interaction) {
    const { durationInput, remindMessage } = getReminderArgs(interaction);

    const { container, reminder } = await runRemindCommand({
      client: interaction.client,
      channelId: interaction.channelId,
      userId: interaction.user.id,
      durationInput,
      remindMessage,
      invalidFormatText: lang.commands.remind.messages.invalidFormat.slash,
    });

    if (!reminder) {
      await interaction.reply(container.build({ ephemeral: true }));
      return;
    }

    const reply = await replyAndFetch(interaction, container.build());
    attachReminderCancelCollector(reply, reminder);
  },
} satisfies SlashCommand;
