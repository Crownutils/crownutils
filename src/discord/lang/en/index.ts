import { commonLang } from './common.js';
import type { LangNode } from '../types.js';

/** The English language pack: a typed tree of strings and formatters. */
export const en = {
  common: commonLang,
} as const satisfies LangNode;
