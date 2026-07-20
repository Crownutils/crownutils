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

export const lang = { en, fr } as const;
