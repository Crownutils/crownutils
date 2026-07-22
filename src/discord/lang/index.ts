import type { SupportedLocale } from '@/core/types.js';
import { commonLang as commonEn } from './en/common.js';
import { commonLang as commonFr } from './fr/common.js';
import { commandPacks } from './packs.js';
import type { LangNode } from './types.js';

/** The English language pack: a typed tree of strings and formatters. */
const en = {
  common: commonEn,
  ...commandPacks.en,
} as const satisfies LangNode;

/** The French language pack: a typed tree of strings and formatters. */
const fr = {
  common: commonFr,
  ...commandPacks.fr,
} as const satisfies LangNode;

/** Both language packs keyed by locale - the single entry point for user-facing text. */
export const lang = { en, fr } as const;

/** The English pack shape; both locales mirror it, so it types every lookup. */
type Packs = (typeof lang)['en'];

/** Pack keys that expose a `messages` node (commands, not shared nodes like `common`). */
type MessagesKey = {
  [K in keyof Packs]: 'messages' extends keyof Packs[K] ? K : never;
}[keyof Packs];

/**
 * The `messages` node of `command`'s pack for `locale` - the single home of the
 * `lang[locale][command].messages` lookup every command front repeats. The cast
 * bridges the two locales' identical shapes (they differ only in string values).
 */
export function commandMessages<K extends MessagesKey>(
  locale: SupportedLocale,
  command: K,
): Packs[K]['messages'] {
  return (lang[locale] as Packs)[command].messages;
}
