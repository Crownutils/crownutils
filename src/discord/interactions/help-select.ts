import type { Message } from 'discord.js';
import type { PrefixCommand, SlashCommand } from '@/discord/types/command.js';
import {
  COLLECTOR_IDLE_MS,
  InteractiveMessage,
} from '@/discord/interactions/collector.js';
import type { CommandAuthorization } from '@/core/permissions/types.js';
import {
  HELP_SELECT_ID,
  buildHelpContainer,
} from '@/discord/presentations/help-presentation.js';

/**
 * Attaches a select-menu collector to a `/help` message, limited to
 * `authorId`. Selecting a command re-renders the container to show its
 * details, filtered to commands `userAuthorization` can access; the
 * collector disables itself after `COLLECTOR_IDLE_MS` of inactivity.
 */
export function attachHelpSelectCollector(
  message: Message,
  authorId: string,
  commands: SlashCommand[] | PrefixCommand[],
  userAuthorization: CommandAuthorization,
): void {
  new InteractiveMessage<string | undefined>(
    message,
    undefined,
    (selected, { disabled }) =>
      buildHelpContainer(commands, userAuthorization, { disabled }, selected),
    (interaction, selected) => {
      if (
        interaction.isStringSelectMenu() &&
        interaction.customId === HELP_SELECT_ID
      ) {
        return interaction.values[0];
      }
      return selected;
    },
    { idle: COLLECTOR_IDLE_MS, allowedIds: [authorId] },
  );
}
