import { ping } from './ping.js';
import { remind } from './remind.js';
import { reminders } from './reminders.js';
import { errors } from './errors.js';
import { about } from './about.js';
import { grade } from './grade.js';
import { help } from './help.js';
import { maintenance } from './maintenance.js';

const commands = {
  ping,
  remind,
  reminders,
  about,
  grade,
  help,
  maintenance,
} as const;

/** All user-facing strings, grouped by command, plus shared error strings. */
export const lang = { commands, errors } as const;

export { formatPermissionErrors } from './errors.js';
