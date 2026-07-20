import { Events } from 'discord.js';
import type { EventModule } from '../registries/index.js';
import { runCommandPipeline } from '../pipeline/command-pipeline.js';
import { buildDenialHandlers } from '../pipeline/denial-handlers.js';
import { config } from '@/core/config/index.js';
import { COMMAND_PREFIX } from '../utils/constants.js';
import { sendResponseToMessage } from '../interactions/index.js';
import { resolvePrefixCommand } from '../registries/index.js';
import { isMaintenanceEnabled } from '@/core/repositories/index.js';
import { resolveUserContext } from '../context/user.js';

const event = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    const prefix = message.content.slice(0, COMMAND_PREFIX.length);
    if (prefix.toLowerCase() !== COMMAND_PREFIX) return;

    const withoutPrefix = message.content.slice(COMMAND_PREFIX.length).trim();
    if (withoutPrefix.length === 0) return;

    const parts = withoutPrefix.split(/\s+/);
    const name = parts[0];
    if (name === undefined) return;
    const args = parts.slice(1);

    const command = resolvePrefixCommand(message.client.registries, name);
    if (!command) return;

    const inGuild = message.inGuild();
    const [{ locale, rank }, maintenance] = await Promise.all([
      resolveUserContext(message.author.id),
      isMaintenanceEnabled(),
    ]);

    await runCommandPipeline(
      {
        commandName: command.name,
        requirements: command.requirements,
        inGuild,
        inMainGuild: inGuild && message.guildId === config.mainGuildDiscordId,
        userId: message.author.id,
        rank,
        maintenance,
      },
      {
        execute: () => command.execute(message, args),
        ...buildDenialHandlers({
          locale,
          commandName: command.name,
          logLabel: 'Prefix command failed',
          reply: async (response) => {
            await sendResponseToMessage(message, response);
          },
        }),
      },
    );
  },
} satisfies EventModule<Events.MessageCreate>;

export default event;
