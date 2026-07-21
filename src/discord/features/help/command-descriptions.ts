import type { SupportedLocale } from '@/core/types.js';
import { lang } from '@/discord/lang/index.js';

/** Buckets commands are grouped under in the help listing, in display order. */
export const COMMAND_CATEGORIES = [
  'general',
  'crownicles',
  'reminders',
  'privacy',
  'moderation',
] as const;

export type CommandCategory = (typeof COMMAND_CATEGORIES)[number];

/** Emote shown before each category header in the help overview. */
export const CATEGORY_ICONS: Record<CommandCategory, string> = {
  general: '🧩',
  crownicles: '🎮',
  reminders: '🔔',
  privacy: '🔒',
  moderation: '🛡️',
};

/** Help metadata for one command: its category and a localized description. */
export interface CommandDescription {
  readonly category: CommandCategory;
  readonly description: (locale: SupportedLocale) => string;
}

/**
 * The single source the help listing reads: command name → its category and
 * localized description (pulled from the command's own lang pack, so the text
 * stays defined once). Commands absent here are hidden from help.
 */
export const commandDescriptions: Record<string, CommandDescription> = {
  help: {
    category: 'general',
    description: (locale) => lang[locale].commandHelp.description,
  },
  ping: {
    category: 'general',
    description: (locale) => lang[locale].commandPing.description,
  },
  about: {
    category: 'general',
    description: (locale) => lang[locale].commandAbout.description,
  },
  language: {
    category: 'general',
    description: (locale) => lang[locale].commandLanguage.description,
  },
  register: {
    category: 'general',
    description: (locale) => lang[locale].commandRegister.description,
  },
  legal: {
    category: 'general',
    description: (locale) => lang[locale].commandLegal.description,
  },
  'crownicles-help': {
    category: 'crownicles',
    description: (locale) => lang[locale].commandCrowniclesHelp.description,
  },
  remind: {
    category: 'reminders',
    description: (locale) => lang[locale].commandRemind.description,
  },
  reminders: {
    category: 'reminders',
    description: (locale) => lang[locale].commandReminders.description,
  },
  data: {
    category: 'privacy',
    description: (locale) => lang[locale].commandData.description,
  },
  'delete-data': {
    category: 'privacy',
    description: (locale) => lang[locale].commandDeleteData.description,
  },
  rank: {
    category: 'moderation',
    description: (locale) => lang[locale].commandRank.description,
  },
  'set-rank': {
    category: 'moderation',
    description: (locale) => lang[locale].commandSetRank.description,
  },
  maintenance: {
    category: 'moderation',
    description: (locale) => lang[locale].commandMaintenance.description,
  },
};
