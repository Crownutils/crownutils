import { lang } from '@/lang/index.js';
import { Container, Text, Separator, Title } from '@/lib/components/index.js';
import type { PrefixCommand } from '@/types/command.js';

export const command: PrefixCommand = {
  name: 'ping',
  description: lang.ping.description,
  aliases: ['p', 'latency'],

  async execute(message, _args) {
    const before = Date.now();
    const interim = new Container()
      .color('info')
      .add(new Text(lang.ping.messages.calculating))
      .build();
    const sent = await message.reply(interim);

    const totalMs = sent.createdTimestamp - before;
    const discordMs = Math.round(message.client.ws.ping);

    const final = new Container()
      .color('info')
      .add(
        new Title(lang.ping.messages.title),
        new Separator(),
        new Text(lang.ping.messages.result({ totalMs, discordMs })),
      )
      .build();

    await sent.edit(final);
  },
};
