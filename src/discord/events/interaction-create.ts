import { Events } from 'discord.js';
import type { EventModule } from '../registries/index.js';
import { logger } from '@/shared/index.js';
import { runCommandPipeline } from '../command-pipeline.js';
import { config } from '@/core/config/index.js';
import type { UserLang } from '../lang/index.js';
import { lang } from '../lang/index.js';
import { toError } from '../errors.js';
import { safeReplyToInteraction } from '../interactions/index.js';

const event = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.registries.slash.get(
      interaction.commandName,
    );

    if (!command) {
      logger.warn(
        { command: interaction.commandName },
        'Unknown slash command',
      );
      return;
    }

    const inGuild = interaction.inGuild();
    const userLang: UserLang = 'fr'; // TODO Gets user language from database
    const t = lang[userLang].common;

    await runCommandPipeline(
      {
        requirements: command.requirements,
        inGuild,
        inMainGuild:
          inGuild && interaction.guildId === config.mainGuildDiscordId,
        userId: interaction.user.id,
        ownerId: config.ownerDiscordId,
        privilegedIds: config.privilegedDiscordIds,
        maintenance: false, // TODO maintenance
      },
      {
        execute: () => command.execute(interaction),
        onMaintenance: () => safeReplyToInteraction(interaction, t.maintenance),
        onScopeDenied: (scope) =>
          safeReplyToInteraction(interaction, t.scopeDenied(scope)),
        onPermissionDenied: () =>
          safeReplyToInteraction(interaction, t.permissionDenied),
        onUnexpectedError: async (error) => {
          logger.error(
            { err: toError(error), command: interaction.commandName },
            'Slash command failed',
          );
          await safeReplyToInteraction(interaction, t.unexpectedError);
        },
        ...(command.gate && {
          gate: () => command.gate!(interaction),
          onGateDenied: command.onGateDenied
            ? () => command.onGateDenied!(interaction)
            : () => safeReplyToInteraction(interaction, t.gateDenied),
        }),
      },
    );
  },
} satisfies EventModule<Events.InteractionCreate>;

export default event;
