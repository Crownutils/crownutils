import { lang } from '@/lang/index.js';
import { buildBotInfoContainer } from '@/services/presentations/about-presentation.js';
import type { PrefixCommand } from '@/types/command/command.js';

export const command = {
  name: 'about',
  aliases: ['botinfo'],
  description: lang.about.commandDescription,
  requirements: {
    scope: 'global',
  },

  async execute(interaction) {
    const reply = buildBotInfoContainer().build();
    await interaction.reply(reply);
  },
} satisfies PrefixCommand;
