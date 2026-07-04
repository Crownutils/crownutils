import { commonLang } from './common.js';
import type { LangNode } from '../types.js';
import { ping } from './ping.js';

/** The French language pack: a typed tree of strings and formatters. */
export const fr = {
  common: commonLang,
  commandPing: ping,
} as const satisfies LangNode;
