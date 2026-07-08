import { createContainer, Text } from '@/discord/components/index.js';
import { sendResponseToMessage } from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import type { PrefixCommand } from '@/discord/registries/index.js';
import { runPingCommand } from '@/discord/features/ping/ping.service.js';
import { MessageFlags } from 'discord.js';

const command = {
  name: 'ping',
  aliases: ['p', 'latency'],
  requirements: { scope: 'anywhere', authorization: 'normal' },

  async execute(message, _args) {
    const userLanguage = await resolveUserLocale(message.author.id);
    const before = Date.now();
    const interim = createContainer('brand').add(
      new Text(lang[userLanguage].commandPing.messages.calculating),
    );
    const sent = await sendResponseToMessage(message, { container: interim });

    const totalLatencyMs = sent.createdTimestamp - before;
    const discordLatencyMs = Math.round(message.client.ws.ping);

    const response = runPingCommand(
      { totalLatencyMs, discordLatencyMs },
      userLanguage,
    );

    await sent.edit({
      flags: [MessageFlags.IsComponentsV2] as const,
      components: [response.container.build()],
    });
  },
} satisfies PrefixCommand;

export default command;
