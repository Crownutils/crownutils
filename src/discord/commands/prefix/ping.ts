import { PREFIX } from '@/discord/constants.js';
import { lang } from '@/discord/lang/index.js';
import { Container, Text } from '@/discord/components/index.js';
import { buildPingResultContainer } from '@/discord/presentations/ping-presentation.js';
import type { PrefixCommand } from '@/discord/types/command.js';

/** `c!ping` (aliases `p`, `latency`): shows bot and Discord latency. */
export const command = {
  name: 'ping',
  description: lang.commands.ping.commandDescription,
  aliases: ['p', 'latency'],
  requirements: {
    scope: 'global',
  },
  help: {
    usagePrefix: `${PREFIX}ping`,
  },

  async execute(message, _args) {
    const before = Date.now();
    const interim = new Container()
      .color('info')
      .add(new Text(lang.commands.ping.messages.calculating))
      .build();
    const sent = await message.reply(interim);

    const totalMs = sent.createdTimestamp - before;
    const discordMs = Math.round(message.client.ws.ping);

    await sent.edit(buildPingResultContainer(totalMs, discordMs).build());
  },
} satisfies PrefixCommand;
