import { ping } from './ping.js';
import { reminder } from './reminder.js';
import { errors } from './errors.js';
import { about } from './about.js';
import { grade } from './grade.js';

const commands = { ping, reminder, about, grade } as const;
export const lang = { commands, errors } as const;

export { formatPermissionErrors } from './errors.js';
