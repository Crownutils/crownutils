import { Events } from 'discord.js';
import type { EventModule } from '../registries/index.js';
import { logger } from '@/shared/index.js';
import { runCommandPipeline } from '../pipeline/command-pipeline.js';
import { config } from '@/core/config/index.js';
import { lang } from '../lang/index.js';
import { buildErrorContainer, toError } from '../utils/errors.js';
import { sendResponseToInteraction } from '../interactions/index.js';
import { isMaintenanceEnabled } from '@/core/repositories/index.js';
import { resolveUserLocale } from '../context/locale.js';
import { resolveUserRank } from '../context/rank.js';

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
    const userLanguage = await resolveUserLocale(interaction.user.id);
    const t = lang[userLanguage].common;

    await runCommandPipeline(
      {
        commandName: interaction.commandName,
        requirements: command.requirements,
        inGuild,
        inMainGuild:
          inGuild && interaction.guildId === config.mainGuildDiscordId,
        userId: interaction.user.id,
        rank: await resolveUserRank(interaction.user.id),
        maintenance: await isMaintenanceEnabled(),
      },
      {
        execute: () => command.execute(interaction),
        onBanned: () =>
          sendResponseToInteraction(interaction, {
            container: buildErrorContainer(t.banned),
            ephemeral: true,
          }),
        onMaintenance: () =>
          sendResponseToInteraction(interaction, {
            container: buildErrorContainer(t.maintenance),
            ephemeral: true,
          }),
        onScopeDenied: (scope) =>
          sendResponseToInteraction(interaction, {
            container: buildErrorContainer(t.scopeDenied(scope)),
            ephemeral: true,
          }),
        onPermissionDenied: () =>
          sendResponseToInteraction(interaction, {
            container: buildErrorContainer(t.permissionDenied),
            ephemeral: true,
          }),
        onUnexpectedError: async (error) => {
          logger.error(
            { err: toError(error), command: interaction.commandName },
            'Slash command failed',
          );
          await sendResponseToInteraction(interaction, {
            container: buildErrorContainer(t.unexpectedError),
            ephemeral: true,
          });
        },
        onLegalNotAccepted: async () =>
          await sendResponseToInteraction(interaction, {
            container: buildErrorContainer(t.legalNotAccepted),
            ephemeral: true,
          }),
        ...(command.gate && {
          gate: () => command.gate!(interaction),
          onGateDenied: command.onGateDenied
            ? () => command.onGateDenied!(interaction)
            : () =>
                sendResponseToInteraction(interaction, {
                  container: buildErrorContainer(t.gateDenied),
                  ephemeral: true,
                }),
        }),
      },
    );
  },
} satisfies EventModule<Events.InteractionCreate>;

export default event;
