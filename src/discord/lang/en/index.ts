import { commonLang } from './common.js';
import type { LangNode } from '../types.js';
import { ping } from './ping.js';

/** The English language pack: a typed tree of strings and formatters. */
export const en = {
  common: commonLang,
  commandPing: ping,
} as const satisfies LangNode;
