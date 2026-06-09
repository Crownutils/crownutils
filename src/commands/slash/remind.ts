import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { lang } from '@/lang/index.js';
import { buildErrorContainer } from '@/lib/errors.js';
import { buildReminderCreatedContainer } from '@/lib/reminder-presentation.js';
import {
  DEFAULT_REMINDER_DURATION,
  createReminderFromInput,
} from '@/services/reminder-service.js';
import type { SlashCommand } from '@/types/command.js';

function getReminderArgs(interaction: ChatInputCommandInteraction): {
  durationInput: string;
  remindMessage: string;
} {
  const timeOption = interaction.options.getString('time');
  const messageOption = interaction.options.getString('message');

  if (!timeOption && !messageOption) {
    return {
      durationInput: DEFAULT_REMINDER_DURATION,
      remindMessage: lang.reminder.messages.defaultMessage,
    };
  }

  return {
    durationInput: timeOption ?? '',
    remindMessage: messageOption ?? '',
  };
}

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription(lang.reminder.description)
    .addStringOption((option) =>
      option
        .setName('time')
        .setDescription(lang.reminder.options.time)
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription(lang.reminder.options.message)
        .setRequired(false),
    ),

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
      const text =
        result.error === 'duration_too_long'
          ? lang.reminder.messages.durationTooLong
          : lang.reminder.messages.invalidFormat.slash;
      await interaction.reply(
        buildErrorContainer(text).build({ ephemeral: true }),
      );
      return;
    }

    await interaction.reply(
      buildReminderCreatedContainer(result.reminder).build(),
    );
  },
};
