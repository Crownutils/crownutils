import { Events } from 'discord.js';
import { slashCommands } from '@/discord/registries/slash-registry.js';
import type { Event } from '@/discord/types/event.js';
import {
  buildCommandPermissionsErrorContainer,
  buildErrorContainer,
  safeDiscord,
} from '@/discord/errors.js';
import { runCommandPipeline } from '@/discord/command-pipeline.js';
import { lang } from '@/discord/lang/index.js';
import { remindUnreadMails } from '@/discord/mails/unread-reminder.js';
import {
  attachLegalGate,
  buildLegalGateContainer,
} from '@/discord/presentations/legal-presentation.js';
import { replyAndFetch } from '@/discord/interactions/reply.js';
import { logger } from '@/shared/logger.js';

/**
 * Dispatches slash command interactions: checks maintenance mode and
 * permission requirements, runs the command, and reports unexpected errors
 * back to the user.
 */
export const event = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = slashCommands.get(interaction.commandName);
    if (!command) return;

    await runCommandPipeline(
      {
        userId: interaction.user.id,
        commandName: interaction.commandName,
        guildId: interaction.guildId,
        requirements: command.requirements,
      },
      {
        execute: () => command.execute(interaction),
        onExecuted:
          interaction.guildId !== null &&
          interaction.commandName !== 'mail' &&
          interaction.commandName !== 'mails'
            ? () => remindUnreadMails(interaction.user.id, interaction.channel)
            : undefined,
        onMaintenance: () =>
          safeDiscord(
            interaction.reply(
              buildErrorContainer(lang.errors.maintenance).build({
                ephemeral: true,
              }),
            ),
            'interaction-create.onMaintenance',
          ),
        onLegalNotAccepted: async () => {
          const reply = await safeDiscord(
            replyAndFetch(
              interaction,
              buildLegalGateContainer().build({ ephemeral: true }),
            ),
            'interaction-create.legalGate',
          );
          if (reply) attachLegalGate(reply, interaction.user.id);
        },
        onPermissionDenied: (errors) =>
          safeDiscord(
            interaction.reply(
              buildCommandPermissionsErrorContainer(errors).build({
                ephemeral: true,
              }),
            ),
            'interaction-create.onPermissionDenied',
          ),

        onUnexpectedError: (error) => {
          logger.error(
            { error, command: interaction.commandName },
            'Slash command execution failed.',
          );

          const reply = buildErrorContainer(lang.errors.unexpected).build({
            ephemeral: true,
          });

          return interaction.replied || interaction.deferred
            ? safeDiscord(
                interaction.followUp(reply),
                'interaction-create.followUp',
              )
            : safeDiscord(interaction.reply(reply), 'interaction-create.reply');
        },
      },
    );
  },
} satisfies Event<Events.InteractionCreate>;
