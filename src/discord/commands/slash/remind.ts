import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import { buildErrorContainer } from '@/discord/errors.js';
import { buildReminderCreatedContainer } from '@/discord/presentations/reminder-presentation.js';
import { attachReminderCancelCollector } from '@/discord/interactions/reminder-cancel.js';
import {
  DEFAULT_REMINDER_DURATION,
  createReminderFromInput,
  getMaxRemindersForUser,
} from '@/discord/reminders/reminder-bridge.js';
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

    const result = await createReminderFromInput(
      interaction.client,
      interaction.channelId,
      interaction.user.id,
      durationInput,
      remindMessage,
    );

    if (!result.ok) {
      const errorText = {
        invalid_format: lang.commands.remind.messages.invalidFormat.slash,
        duration_too_long: lang.commands.remind.messages.durationTooLong,
        limit_reached: lang.commands.remind.messages.limitReached({
          max: getMaxRemindersForUser(interaction.user.id),
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
