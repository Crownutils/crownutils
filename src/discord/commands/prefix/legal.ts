import { PREFIX } from '@/discord/constants.js';
import { lang } from '@/discord/lang/index.js';
import { runLegalCommand } from '@/discord/legal/legal-command.js';
import { attachLegalViewer } from '@/discord/presentations/legal-presentation.js';
import type { PrefixCommand } from '@/discord/types/command.js';

/** `c!legal`: views the privacy policy and terms of service, and accepts them. */
export const command = {
  name: 'legal',
  description: lang.commands.legal.commandDescription,
  requirements: {
    scope: 'everywhere',
  },
  help: {
    usagePrefix: `${PREFIX}legal`,
  },

  async execute(message, _args) {
    const { container, status } = await runLegalCommand(message.author.id);
    const sent = await message.reply(container.build());
    attachLegalViewer(sent, message.author.id, status);
  },
} satisfies PrefixCommand;
