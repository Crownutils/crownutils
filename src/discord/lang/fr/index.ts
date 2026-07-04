import { commonLang } from './common.js';
import type { LangNode } from '../types.js';
import { ping } from './ping.js';
import { language } from './language.js';

/** The French language pack: a typed tree of strings and formatters. */
export const fr = {
  common: commonLang,
  commandPing: ping,
  commandLanguage: language,
} as const satisfies LangNode;
