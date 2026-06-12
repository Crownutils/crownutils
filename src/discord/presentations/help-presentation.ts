import { Container } from '../components/container.js';
import type { V2Component } from '../components/component.js';
import { Select, Separator, Text, Title } from '../components/index.js';
import { lang } from '../lang/index.js';
import { md } from '../markdown.js';
import type { PrefixCommand, SlashCommand } from '../types/command.js';

/** Custom id of the `/help` command select menu. */
export const HELP_SELECT_ID = 'help-select';
const MAIN_MENU = 'Menu Principal';

/**
 * Builds the `/help` container. With no `selectedCommand` (or `MAIN_MENU`),
 * shows the welcome message; otherwise shows the matching command's
 * description, usage, and aliases (prefix commands only).
 */
export function buildHelpContainer(
  commands: SlashCommand[] | PrefixCommand[],
  options?: { disabled?: boolean },
  selectedCommand?: string,
): Container {
  const selectMenu = new Select(HELP_SELECT_ID).placeholder(
    lang.commands.help.messages.selectMenu.placeholder,
  );

  selectMenu.option(MAIN_MENU, MAIN_MENU);
  for (const command of commands) {
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

  const selected = selectedCommand && selectedCommand !== MAIN_MENU
    ? commands.find(
        (command) =>
          ('data' in command ? command.data.name : command.name) ===
          selectedCommand,
      )
    : undefined;

  const title = selected
    ? 'data' in selected
      ? selected.data.name
      : selected.name
    : lang.commands.help.messages.title;

  const description = selected
    ? 'data' in selected
      ? selected.data.description
      : selected.description
    : lang.commands.help.messages.welcome;

  const usage = selected
    ? 'data' in selected
      ? lang.commands.help.messages.usage(selected.help.usageSlash!)
      : lang.commands.help.messages.usage(selected.help.usagePrefix!)
    : '';

  const aliases = selected
    ? 'data' in selected
      ? undefined
      : selected.aliases
    : undefined;

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
