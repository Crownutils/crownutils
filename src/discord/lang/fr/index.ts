import { commonLang } from './common.js';
import type { LangNode } from '../types.js';

/** The French language pack: a typed tree of strings and formatters. */
export const fr = {
  common: commonLang,
} as const satisfies LangNode;
