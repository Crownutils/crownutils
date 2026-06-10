import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { lang } from '@/lang/index.js';
import { buildErrorContainer } from '@/lib/errors.js';
import { buildReminderCreatedContainer } from '@/services/presentations/reminder-presentation.js';
import { attachReminderCancelCollector } from '@/interactions/reminder-cancel.js';
import {
  DEFAULT_REMINDER_DURATION,
  MAX_REMINDERS_PER_USER,
  createReminderFromInput,
} from '@/services/reminder-service.js';
import type { SlashCommand } from '@/types/command/command.js';

function getReminderArgs(interaction: ChatInputCommandInteraction): {
  durationInput: string;
  remindMessage: string;
} {
  const timeOption = interaction.options.getString('time');
  const messageOption = interaction.options.getString('message');

  if (!timeOption && !messageOption) {
    return {
      durationInput: DEFAULT_REMINDER_DURATION,
      remindMessage: lang.commands.reminder.messages.defaultMessage,
    };
  }

  return {
    durationInput: timeOption ?? '',
    remindMessage: messageOption ?? '',
  };
}

export const command = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription(lang.commands.reminder.commandDescription)
    .addStringOption((option) =>
      option
        .setName('time')
        .setDescription(lang.commands.reminder.options.time)
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription(lang.commands.reminder.options.message)
        .setRequired(false),
    ),
  requirements: {
    scope: 'global',
  },

  async execute(interaction) {
    const { durationInput, remindMessage } = getReminderArgs(interaction);

    const result = await createReminderFromInput(
      interaction.client,
      interaction.channelId,
      interaction.user.id,
      durationInput,
      remindMessage,
    );

    if (!result.ok) {
      const errorText = {
        invalid_format: lang.commands.reminder.messages.invalidFormat.slash,
        duration_too_long: lang.commands.reminder.messages.durationTooLong,
        limit_reached: lang.commands.reminder.messages.limitReached({
          max: MAX_REMINDERS_PER_USER,
        }),
      };
      await interaction.reply(
        buildErrorContainer(errorText[result.error]).build({ ephemeral: true }),
      );
      return;
    }

    await interaction.reply(
      buildReminderCreatedContainer(result.reminder).build(),
    );
    const reply = await interaction.fetchReply();
    attachReminderCancelCollector(reply, result.reminder);
  },
} satisfies SlashCommand;
