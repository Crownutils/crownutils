import { commonLang } from './common.js';
import type { LangNode } from '../types.js';
import { ping } from './ping.js';
import { language } from './language.js';
import { register } from './register.js';
import { legal, legalCommand } from './legal.js';
import { about } from './about.js';
import { rank } from './rank.js';
import { setRank } from './setrank.js';
import { data } from './data.js';
import { maintenance } from './maintenance.js';

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
  commandSetRank: setRank,
  commandData: data,
  commandMaintenance: maintenance,
} as const satisfies LangNode;
