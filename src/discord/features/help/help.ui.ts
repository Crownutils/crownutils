import type { Authorization, CommandScope } from '@/core/permissions/index.js';
import type { SupportedLocale } from '@/core/types.js';
import {
  Button,
  ButtonActionRow,
  type Container,
  createContainer,
  SelectActionRow,
  SelectMenu,
  Separator,
  Text,
} from '@/discord/components/index.js';
import { icons } from '@/discord/theme/icons.js';
import { md } from '@/discord/theme/markdown.js';
import { lang } from '@/discord/lang/index.js';
import {
  CATEGORY_ICONS,
  COMMAND_CATEGORIES,
  type CommandCategory,
} from './command-descriptions.js';

/** Custom ids of the help browser's controls, matched in the help controller's `reduce`. */
export const HELP_COMMAND_SELECT_ID = 'help-command';
export const HELP_BACK_ID = 'help-back';

const SELECT_DESCRIPTION_MAX = 100;

/** One slash option of a command, as shown in its detail card. */
export interface HelpOption {
  readonly name: string;
  readonly description: (locale: SupportedLocale) => string;
}

/** One command as shown in the help listing and detail views. */
export interface HelpEntry {
  readonly name: string;
  readonly aliases: readonly string[];
  readonly category: CommandCategory;
  readonly scope: CommandScope;
  readonly authorization: Authorization;
  readonly description: (locale: SupportedLocale) => string;
  readonly options: readonly HelpOption[];
}

function messages(locale: SupportedLocale) {
  return lang[locale].commandHelp.messages;
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/** The command picker shown below every help view; a pick opens that command's details. */
export function buildCommandSelectRow(
  locale: SupportedLocale,
  entries: readonly HelpEntry[],
  selected: string | undefined,
  disabled: boolean,
): SelectActionRow {
  const select = new SelectMenu(HELP_COMMAND_SELECT_ID)
    .placeholder(messages(locale).selectPlaceholder)
    .options(
      entries.map((entry) => ({
        label: entry.name,
        value: entry.name,
        description: truncate(
          entry.description(locale),
          SELECT_DESCRIPTION_MAX,
        ),
        default: entry.name === selected,
      })),
    );
  if (disabled) select.disabled();
  return new SelectActionRow().set(select);
}

/** Overview: every accessible command, grouped by category. */
export function buildHelpOverview(
  locale: SupportedLocale,
  entries: readonly HelpEntry[],
): Container {
  const t = messages(locale);
  const container = createContainer('brand').add(
    new Text(`${icons.info} ${t.title}`).title(),
    new Text(t.intro).size('subtle'),
  );

  for (const category of COMMAND_CATEGORIES) {
    const inCategory = entries
      .filter((entry) => entry.category === category)
      .sort((a, b) => a.name.localeCompare(b.name));
    if (inCategory.length === 0) continue;

    const list = new Text(
      `${CATEGORY_ICONS[category]} ${t.categories[category]}`,
    ).size('small');
    for (const entry of inCategory) {
      const aliases =
        entry.aliases.length > 0
          ? ` (${entry.aliases.map((alias) => md.code(alias)).join(', ')})`
          : '';
      list.newLine(
        `${md.bold(md.code(entry.name))}${aliases} - ${entry.description(locale)}`,
      );
    }
    container.add(new Separator(), list);
  }

  return container;
}

/** Detail card for one command: description, facts and options, plus a back button. */
export function buildHelpDetail(
  locale: SupportedLocale,
  entry: HelpEntry,
  options?: { disabled?: boolean },
): Container {
  const t = messages(locale);
  const container = createContainer('brand').add(
    new Text(`${icons.info} ${md.code(entry.name)}`).title(),
    new Text(entry.description(locale)),
    new Separator(),
  );

  const facts: string[] = [];
  if (entry.aliases.length > 0) {
    const aliases = entry.aliases.map((alias) => md.code(alias)).join(', ');
    facts.push(`${md.bold(t.detail.aliasesLabel)} : ${aliases}`);
  }
  facts.push(
    `${md.bold(t.detail.scopeLabel)} : ${t.detail.scopes[entry.scope]}`,
  );
  if (entry.authorization !== 'normal') {
    facts.push(
      `${md.bold(t.detail.rankLabel)} : ${t.detail.ranks[entry.authorization]}`,
    );
  }
  const factsText = new Text(facts[0]!);
  for (const fact of facts.slice(1)) factsText.newLine(fact);
  container.add(factsText);

  if (entry.options.length > 0) {
    const optionsText = new Text(md.bold(t.detail.optionsLabel));
    for (const option of entry.options) {
      optionsText.newLine(
        `• ${md.code(option.name)} : ${option.description(locale)}`,
      );
    }
    container.add(optionsText);
  }

  const back = new Button(HELP_BACK_ID).color('secondary').label(t.backButton);
  if (options?.disabled === true) back.disabled();
  container.add(new ButtonActionRow().add(back));

  return container;
}
