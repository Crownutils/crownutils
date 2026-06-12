import { lang } from '@/discord/lang/index.js';
import {
  Container,
  Text,
  Separator,
  Title,
} from '@/discord/components/index.js';
import type { PrefixCommand } from '@/discord/types/command.js';

export const command = {
  name: 'ping',
  description: lang.commands.ping.commandDescription,
  aliases: ['p', 'latency'],
  requirements: {
    scope: 'global',
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

    const final = new Container()
      .color('info')
      .add(
        new Title(lang.commands.ping.messages.title),
        new Separator(),
        new Text(lang.commands.ping.messages.result({ totalMs, discordMs })),
      )
      .build();

    await sent.edit(final);
  },
} satisfies PrefixCommand;
