import { Container } from '../components/container.js';
import type { V2Component } from '../components/component.js';
import { Select, Separator, Text, Title } from '../components/index.js';
import { lang } from '../lang/index.js';
import { md } from '../markdown.js';
import type { PrefixCommand, SlashCommand } from '../types/command.js';
import { isAuthorizationAllowed } from '@/core/permissions/index.js';
import type { CommandAuthorization } from '@/core/permissions/types.js';

/** Custom id of the `/help` command select menu. */
export const HELP_SELECT_ID = 'help-select';
const MAIN_MENU = 'Menu Principal';

interface CommandDescription {
  name: string;
  description: string;
  usage: string;
  aliases?: string[];
}

/** Flattens a slash or prefix command into the fields `/help` displays. */
function describeCommand(
  command: SlashCommand | PrefixCommand,
): CommandDescription {
  if ('data' in command) {
    return {
      name: command.data.name,
      description: command.data.description,
      usage: command.help.usageSlash ?? command.help.usagePrefix ?? '',
      aliases: undefined,
    };
  }
  return {
    name: command.name,
    description: command.description,
    usage: command.help.usagePrefix ?? command.help.usageSlash ?? '',
    aliases: command.aliases,
  };
}

/**
 * Builds the `/help` container. With no `selectedCommand` (or `MAIN_MENU`),
 * shows the welcome message; otherwise shows the matching command's
 * description, usage, and aliases (prefix commands only).
 *
 * Commands whose `requirements.authorization` exceeds `userAuthorization`
 * are hidden entirely (not shown in the select menu, not selectable).
 */
export function buildHelpContainer(
  commands: SlashCommand[] | PrefixCommand[],
  userAuthorization: CommandAuthorization,
  options?: { disabled?: boolean },
  selectedCommand?: string,
): Container {
  const allCommands: (SlashCommand | PrefixCommand)[] = commands;
  const visibleCommands = allCommands.filter((command) =>
    isAuthorizationAllowed(
      command.requirements?.authorization ?? 'public',
      userAuthorization,
    ),
  );

  const selectMenu = new Select(HELP_SELECT_ID).placeholder(
    lang.commands.help.messages.selectMenu.placeholder,
  );

  selectMenu.option(MAIN_MENU, MAIN_MENU);
  for (const command of visibleCommands) {
    if ('data' in command) {
      selectMenu.option(
        command.data.name,
        command.data.name,
        command.data.description,
      );
    } else {
      selectMenu.option(command.name, command.name, command.description);
    }
  }

  if (options?.disabled) {
    selectMenu.disabled();
  }

  const selected =
    selectedCommand && selectedCommand !== MAIN_MENU
      ? visibleCommands.find(
          (command) =>
            ('data' in command ? command.data.name : command.name) ===
            selectedCommand,
        )
      : undefined;

  const selectedDescription = selected ? describeCommand(selected) : undefined;

  const title = selectedDescription
    ? selectedDescription.name
    : lang.commands.help.messages.title;

  const description = selectedDescription
    ? selectedDescription.description
    : lang.commands.help.messages.welcome;

  const usage = selectedDescription
    ? lang.commands.help.messages.usage(selectedDescription.usage)
    : '';

  const aliases = selectedDescription?.aliases;

  const components: V2Component[] = [new Title(title), new Text(description)];

  if (!selectedCommand || selectedCommand === MAIN_MENU) {
    components.push(new Text(lang.commands.help.messages.myPrefix).quote());
  }

  if (selected) {
    components.push(
      new Separator(),
      new Title(lang.commands.help.messages.usageTitle, 'small'),
      new Text(usage),
    );

    if (aliases && aliases.length > 0) {
      const aliasesDesc = aliases.map((a) => md.code(a)).join(' ');
      components.push(
        new Separator(),
        new Title(lang.commands.help.messages.prefixAliasesTitle, 'small'),
        new Text(aliasesDesc),
      );
    }
  }

  components.push(selectMenu);

  return new Container().color('info').add(...components);
}
