import { Locale, SlashCommandBuilder } from 'discord.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import { mountInteractiveReply } from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import {
  createUserListController,
  loadUserCensus,
} from '@/discord/features/users/users.service.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';

function createUsersCommandData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('users')
    .setDescription(lang.en.commandUsers.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandUsers.description,
    });
}

const command = {
  data: createUsersCommandData(),
  requirements: { scope: 'anywhere', authorization: 'owner' },
  async execute(interaction) {
    const locale = await resolveUserLocale(interaction.user.id);
    const census = await loadUserCensus();
    const controller = await createUserListController(
      census,
      interaction.user.id,
      locale,
      interaction.client,
    );
    // The listing carries user ids, so keep it private even in a shared channel.
    await mountInteractiveReply(interaction, controller, { ephemeral: true });
  },
} satisfies SlashCommand;

export default command;
