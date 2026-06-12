import type { Message } from 'discord.js';
import type { PrefixCommand, SlashCommand } from '@/discord/types/command.js';
import { InteractiveMessage } from '@/discord/interactions/collector.js';
import {
  HELP_SELECT_ID,
  buildHelpContainer,
} from '@/discord/presentations/help-presentation.js';

const IDLE_TIME_MS = 120_000;

/**
 * Attaches a select-menu collector to a `/help` message, limited to
 * `authorId`. Selecting a command re-renders the container to show its
 * details; the collector disables itself after `IDLE_TIME_MS` of inactivity.
 */
export function attachHelpSelectCollector(
  message: Message,
  authorId: string,
  commands: SlashCommand[] | PrefixCommand[],
): void {
  new InteractiveMessage<string | undefined>(
    message,
    undefined,
    (selected, { disabled }) =>
      buildHelpContainer(commands, { disabled }, selected),
    (interaction, selected) => {
      if (
        interaction.isStringSelectMenu() &&
        interaction.customId === HELP_SELECT_ID
      ) {
        return interaction.values[0];
      }
      return selected;
    },
    { idle: IDLE_TIME_MS, allowedIds: [authorId] },
  );
}
