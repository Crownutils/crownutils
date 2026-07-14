import { Locale, SlashCommandBuilder } from 'discord.js';
import { resolveUserContext } from '@/discord/context/user.js';
import {
  mountInteractiveReply,
  sendResponseToInteraction,
} from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import { DEFAULT_REMINDER_DURATION } from '@/discord/features/reminder/reminder.duration.js';
import {
  createReminderCancelController,
  runCreateReminder,
} from '@/discord/features/reminder/reminder.service.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';

function createRemindCommandData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('remind')
    .setDescription(lang.en.commandRemind.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandRemind.description,
    })
    .addStringOption((option) =>
      option
        .setName('time')
        .setDescription(lang.en.commandRemind.messages.timeOption)
        .setDescriptionLocalizations({
          [Locale.French]: lang.fr.commandRemind.messages.timeOption,
        })
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription(lang.en.commandRemind.messages.messageOption)
        .setDescriptionLocalizations({
          [Locale.French]: lang.fr.commandRemind.messages.messageOption,
        })
        .setRequired(false),
    );
}

const command = {
  data: createRemindCommandData(),
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(interaction) {
    const { locale, rank } = await resolveUserContext(interaction.user.id);
    const t = lang[locale].commandRemind.messages;

    const time = interaction.options.getString('time');
    const message = interaction.options.getString('message');
    const noArgs = time === null && message === null;

    const outcome = await runCreateReminder({
      userId: interaction.user.id,
      channelId: interaction.channelId,
      rank,
      locale,
      durationInput: noArgs ? DEFAULT_REMINDER_DURATION : (time ?? ''),
      message: noArgs ? t.defaultMessage : (message ?? ''),
      invalidFormatText: t.invalidFormat.slash,
    });

    if (!outcome.ok) {
      await sendResponseToInteraction(interaction, {
        container: outcome.container,
        ephemeral: true,
      });
      return;
    }

    await mountInteractiveReply(
      interaction,
      createReminderCancelController(
        outcome.reminder,
        interaction.user.id,
        locale,
      ),
    );
  },
} satisfies SlashCommand;

export default command;
