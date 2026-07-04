import { Locale, SlashCommandBuilder } from 'discord.js';
import { sendResponseToInteraction } from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';
import { runPingCommand } from '@/discord/usecases/index.js';
import { resolveUserLocale } from '@/discord/locale.js';

function createPingCommandData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('ping')
    .setDescription(lang.en.commandPing.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandPing.description,
    });
}

const command = {
  data: createPingCommandData(),
  requirements: { scope: 'guild', authorization: 'everyone' },
  async execute(interaction) {
    const before = Date.now();
    await interaction.deferReply();
    const totalLatencyMs = Date.now() - before;
    const discordLatencyMs = Math.round(interaction.client.ws.ping);
    await sendResponseToInteraction(
      interaction,
      runPingCommand(
        { totalLatencyMs, discordLatencyMs },
        await resolveUserLocale(interaction.user.id),
      ),
    );
  },
} satisfies SlashCommand;

export default command;
