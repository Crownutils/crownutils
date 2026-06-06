import { pingDescription, pingMessages } from '@/lang/ping.js';
import { Container, render } from '@/lib/components/container.js';
import { Separator } from '@/lib/components/separator.js';
import { Text } from '@/lib/components/text.js';
import { Title } from '@/lib/components/title.js';
import { PrefixCommand } from '@/types/command.js';

export const command: PrefixCommand = {
  name: 'ping',
  description: pingDescription,
  aliases: ['p', 'latency'],

  async execute(message, _args) {
    const before = Date.now();
    const sent = await message.reply(
      render(new Text(pingMessages.calculating)),
    );
    const totalLatency = sent.createdTimestamp - before;
    const discordLatency = Math.round(message.client.ws.ping);
    const final = new Container()
      .color('info')
      .add(
        new Title(pingMessages.title),
        new Separator(),
        new Text(pingMessages.result(totalLatency, discordLatency)),
      )
      .build();

    await sent.edit({ ...final, content: null });
  },
};
