import { ping } from './ping.js';
import { remind } from './remind.js';
import { reminders } from './reminders.js';
import { errors } from './errors.js';
import { about } from './about.js';
import { grade } from './grade.js';
import { help } from './help.js';

const commands = { ping, remind, reminders, about, grade, help } as const;
export const lang = { commands, errors } as const;

export { formatPermissionErrors } from './errors.js';
