import { Events } from 'discord.js';
import type { EventModule } from '../registries/index.js';
import { logger } from '@/shared/index.js';
import { runCommandPipeline } from '../pipeline/command-pipeline.js';
import { config } from '@/core/config/index.js';
import { lang } from '../lang/index.js';
import { buildErrorContainer, toError } from '../utils/errors.js';
import { COMMAND_PREFIX } from '../utils/constants.js';
import { sendResponseToMessage } from '../interactions/index.js';
import { isMaintenanceEnabled } from '@/core/repositories/index.js';
import { resolveUserLocale } from '../context/locale.js';
import { resolveUserRank } from '../context/rank.js';

const event = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(COMMAND_PREFIX)) return;

    const withoutPrefix = message.content.slice(COMMAND_PREFIX.length).trim();
    if (withoutPrefix.length === 0) return;

    const parts = withoutPrefix.split(/\s+/);
    const name = parts[0];
    if (name === undefined) return;
    const args = parts.slice(1);

    const command = message.client.registries.prefix.get(name);
    if (!command) return;

    const inGuild = message.inGuild();
    const userLanguage = await resolveUserLocale(message.author.id);
    const t = lang[userLanguage].common;

    /** `sendResponseToMessage` resolves to the sent Message; wrap it so every
     * denial handler returns `Promise<void>` and is actually awaited (no `void`).
    **/
    const reply = async (text: string): Promise<void> => {
      await sendResponseToMessage(message, {
        container: buildErrorContainer(text),
      });
    };

    await runCommandPipeline(
      {
        commandName: command.name,
        requirements: command.requirements,
        inGuild,
        inMainGuild: inGuild && message.guildId === config.mainGuildDiscordId,
        userId: message.author.id,
        rank: await resolveUserRank(message.author.id),
        maintenance: await isMaintenanceEnabled(),
      },
      {
        execute: () => command.execute(message, args),
        onBanned: () => reply(t.banned),
        onMaintenance: () => reply(t.maintenance),
        onScopeDenied: (scope) => reply(t.scopeDenied(scope)),
        onPermissionDenied: () => reply(t.permissionDenied),
        onUnexpectedError: async (error) => {
          logger.error(
            { err: toError(error), command: name },
            'Prefix command failed',
          );
          await reply(t.unexpectedError);
        },
        onLegalNotAccepted: () => reply(t.legalNotAccepted),
        ...(command.gate && {
          gate: () => command.gate!(message, args),
          onGateDenied: command.onGateDenied
            ? () => command.onGateDenied!(message, args)
            : () => reply(t.gateDenied),
        }),
      },
    );
  },
} satisfies EventModule<Events.MessageCreate>;

export default event;
