import { commonLang } from './common.js';
import type { LangNode } from '../types.js';
import { ping } from './ping.js';
import { language } from './language.js';
import { register } from './register.js';
import { legal, legalCommand } from './legal.js';
import { about } from './about.js';
import { rank } from './rank.js';

/** The French language pack: a typed tree of strings and formatters. */
export const fr = {
  common: commonLang,
  commandPing: ping,
  commandLanguage: language,
  commandRegister: register,
  commandLegal: legalCommand,
  legal,
  commandAbout: about,
  commandRank: rank,
} as const satisfies LangNode;
