import { Locale, SlashCommandBuilder } from 'discord.js';
import { listActiveReminders } from '@/core/repositories/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import { mountInteractiveReply } from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import { createReminderListController } from '@/discord/features/reminder/reminder.service.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';

function createRemindersCommandData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('reminders')
    .setDescription(lang.en.commandReminders.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandReminders.description,
    });
}

const command = {
  data: createRemindersCommandData(),
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(interaction) {
    const locale = await resolveUserLocale(interaction.user.id);
    const reminders = await listActiveReminders(interaction.user.id);
    await mountInteractiveReply(
      interaction,
      createReminderListController(reminders, interaction.user.id, locale),
    );
  },
} satisfies SlashCommand;

export default command;
