import { ping } from './ping.js';
import { remind } from './remind.js';
import { reminders } from './reminders.js';
import { errors } from './errors.js';
import { about } from './about.js';
import { grade } from './grade.js';
import { help } from './help.js';
import { maintenance } from './maintenance.js';
import { crowniclesHelp } from './crownicles-help.js';
import { invite } from './invite.js';
import { mail, mails } from './mail.js';
import { legal } from './legal.js';
import { data } from './data.js';
import { deleteData } from './delete-data.js';

const commands = {
  ping,
  remind,
  reminders,
  about,
  grade,
  help,
  maintenance,
  crowniclesHelp,
  invite,
  mail,
  mails,
  legal,
  data,
  deleteData,
} as const;

/** All user-facing strings, grouped by command, plus shared error strings. */
export const lang = { commands, errors } as const;

export { formatPermissionErrors } from './errors.js';
