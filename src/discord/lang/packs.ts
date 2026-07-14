import { ping as pingEn } from './en/ping.js';
import { ping as pingFr } from './fr/ping.js';
import { language as languageEn } from './en/language.js';
import { language as languageFr } from './fr/language.js';
import { register as registerEn } from './en/register.js';
import { register as registerFr } from './fr/register.js';
import {
  legal as legalEn,
  legalCommand as legalCommandEn,
} from './en/legal.js';
import {
  legal as legalFr,
  legalCommand as legalCommandFr,
} from './fr/legal.js';
import { about as aboutEn } from './en/about.js';
import { about as aboutFr } from './fr/about.js';
import { rank as rankEn } from './en/rank.js';
import { rank as rankFr } from './fr/rank.js';
import { setRank as setRankEn } from './en/set-rank.js';
import { setRank as setRankFr } from './fr/set-rank.js';
import { data as dataEn } from './en/data.js';
import { data as dataFr } from './fr/data.js';
import { maintenance as maintenanceEn } from './en/maintenance.js';
import { maintenance as maintenanceFr } from './fr/maintenance.js';
import { remind as remindEn } from './en/remind.js';
import { remind as remindFr } from './fr/remind.js';
import { reminders as remindersEn } from './en/reminders.js';
import { reminders as remindersFr } from './fr/reminders.js';

/**
 * Every command's language pack, both locales listed side by side so adding a
 * feature here is the only place to touch - neither locale can be forgotten.
 */
export const commandPacks = {
  en: {
    commandPing: pingEn,
    commandLanguage: languageEn,
    commandRegister: registerEn,
    commandLegal: legalCommandEn,
    legal: legalEn,
    commandAbout: aboutEn,
    commandRank: rankEn,
    commandSetRank: setRankEn,
    commandData: dataEn,
    commandMaintenance: maintenanceEn,
    commandRemind: remindEn,
    commandReminders: remindersEn,
  },
  fr: {
    commandPing: pingFr,
    commandLanguage: languageFr,
    commandRegister: registerFr,
    commandLegal: legalCommandFr,
    legal: legalFr,
    commandAbout: aboutFr,
    commandRank: rankFr,
    commandSetRank: setRankFr,
    commandData: dataFr,
    commandMaintenance: maintenanceFr,
    commandRemind: remindFr,
    commandReminders: remindersFr,
  },
} as const;
