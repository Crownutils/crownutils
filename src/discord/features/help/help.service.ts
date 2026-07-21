import { Locale } from 'discord.js';
import { isAuthorized } from '@/core/permissions/index.js';
import type { Rank, SupportedLocale } from '@/core/types.js';
import type { InteractiveMessage } from '@/discord/interactions/index.js';
import type {
  CommandRegistries,
  SlashCommand,
} from '@/discord/registries/index.js';
import { commandDescriptions } from './command-descriptions.js';
import {
  buildCommandSelectRow,
  buildHelpDetail,
  buildHelpOverview,
  HELP_BACK_ID,
  HELP_COMMAND_SELECT_ID,
  type HelpEntry,
  type HelpOption,
} from './help.ui.js';

/** `undefined` shows the overview; a command name shows that command's details. */
interface HelpState {
  readonly selectedCommand?: string | undefined;
}

/** The slash options of `command`, with their localized descriptions. */
function optionsOf(command: SlashCommand): HelpOption[] {
  return (command.data.toJSON().options ?? []).map((option) => ({
    name: option.name,
    description: (locale) =>
      locale === 'fr'
        ? (option.description_localizations?.[Locale.French] ??
          option.description)
        : option.description,
  }));
}

/** The described commands `rank` may use, with everything the help views show. */
function collectEntries(
  rank: Rank,
  registries: CommandRegistries,
): HelpEntry[] {
  const entries: HelpEntry[] = [];
  for (const command of registries.slash.values()) {
    const meta = commandDescriptions[command.data.name];
    if (meta === undefined) continue;
    if (!isAuthorized(command.requirements.authorization, { rank })) continue;

    entries.push({
      name: command.data.name,
      aliases: registries.prefix.get(command.data.name)?.aliases ?? [],
      category: meta.category,
      description: meta.description,
      scope: command.requirements.scope,
      authorization: command.requirements.authorization,
      options: optionsOf(command),
    });
  }
  return entries;
}

/**
 * Builds the `help` controller: an overview grouped by category with a command
 * picker; picking a command swaps in its detail card (a back button returns to
 * the overview). Filtered by authorization only, so it stays a full catalog of
 * what the user may run wherever they ask.
 */
export function createHelpController(
  userId: string,
  locale: SupportedLocale,
  rank: Rank,
  registries: CommandRegistries,
): InteractiveMessage<HelpState> {
  const entries = collectEntries(rank, registries);
  const findEntry = (name: string): HelpEntry | undefined =>
    entries.find((entry) => entry.name === name);

  return {
    initialState: {},
    allowedIds: [userId],

    render(state, { disabled }) {
      const entry = state.selectedCommand
        ? findEntry(state.selectedCommand)
        : undefined;
      const container = entry
        ? buildHelpDetail(locale, entry, { disabled })
        : buildHelpOverview(locale, entries);
      return [
        container,
        buildCommandSelectRow(locale, entries, state.selectedCommand, disabled),
      ];
    },

    reduce(state, interaction) {
      if (
        interaction.isStringSelectMenu() &&
        interaction.customId === HELP_COMMAND_SELECT_ID
      ) {
        return { selectedCommand: interaction.values[0] };
      }
      if (interaction.isButton() && interaction.customId === HELP_BACK_ID) {
        return { selectedCommand: undefined };
      }
      return state;
    },
  };
}
