import { commonLang } from './common.js';
import type { LangNode } from '../types.js';
import { ping } from './ping.js';
import { language } from './language.js';
import { register } from './register.js';
import { legal, legalCommand } from './legal.js';

/** The English language pack: a typed tree of strings and formatters. */
export const en = {
  common: commonLang,
  commandPing: ping,
  commandLanguage: language,
  commandRegister: register,
  commandLegal: legalCommand,
  legal,
} as const satisfies LangNode;
