import { SlashCommandBuilder } from 'discord.js';
import { resolveAuthorization } from '@/core/permissions/index.js';
import { lang } from '@/discord/lang/index.js';
import { replyAndFetch } from '@/discord/interactions/reply.js';
import {
  attachCrowniclesHelp,
  buildCrowniclesHelpContainer,
} from '@/discord/presentations/crownicles-help/index.js';
import type { SlashCommand } from '@/discord/types/command.js';

/** `/crownicles-help [category]`: opens the Crownicles help center. */
export const command = {
  data: new SlashCommandBuilder()
    .setName('crownicles-help')
    .setDescription(lang.commands.crowniclesHelp.commandDescription)
    .addStringOption((option) =>
      option
        .setName('category')
        .setDescription(lang.commands.crowniclesHelp.options.category)
        .setRequired(false),
    ),
  requirements: {
    scope: 'global',
  },
  help: {
    usageSlash: '/crownicles-help [category]',
  },

  async execute(interaction) {
    const authorization = resolveAuthorization(interaction.user.id);
    const category = interaction.options.getString('category') ?? undefined;

    const container = buildCrowniclesHelpContainer(authorization, category);
    const reply = await replyAndFetch(interaction, container.build());

    attachCrowniclesHelp(reply, interaction.user.id, authorization, category);
  },
} satisfies SlashCommand;
