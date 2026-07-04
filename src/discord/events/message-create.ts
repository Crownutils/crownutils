import { Events } from 'discord.js';
import type { EventModule } from '../registries/index.js';
import { logger } from '@/shared/index.js';
import { runCommandPipeline } from '../command-pipeline.js';
import { config } from '@/core/config/index.js';
import { lang } from '../lang/index.js';
import { toError } from '../errors.js';
import { COMMAND_PREFIX } from '../constants.js';
import { safeReplyToMessage } from '../interactions/index.js';
import { isMaintenanceEnabled } from '@/core/repositories/index.js';
import { resolveUserLocale } from '../locale.js';

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

    await runCommandPipeline(
      {
        requirements: command.requirements,
        inGuild,
        inMainGuild: inGuild && message.guildId === config.mainGuildDiscordId,
        userId: message.author.id,
        ownerId: config.ownerDiscordId,
        privilegedIds: config.privilegedDiscordIds,
        maintenance: await isMaintenanceEnabled(),
      },
      {
        execute: () => command.execute(message, args),
        onMaintenance: () => safeReplyToMessage(message, t.maintenance),
        onScopeDenied: (scope) =>
          safeReplyToMessage(message, t.scopeDenied(scope)),
        onPermissionDenied: () =>
          safeReplyToMessage(message, t.permissionDenied),
        onUnexpectedError: async (error) => {
          logger.error(
            { err: toError(error), command: name },
            'Slash command failed',
          );
          await safeReplyToMessage(message, t.unexpectedError);
        },
        ...(command.gate && {
          gate: () => command.gate!(message, args),
          onGateDenied: command.onGateDenied
            ? () => command.onGateDenied!(message, args)
            : () => safeReplyToMessage(message, t.gateDenied),
        }),
      },
    );
  },
} satisfies EventModule<Events.MessageCreate>;

export default event;
