import { ping } from './ping.js';
import { reminder } from './reminder.js';
import { errors } from './errors.js';
import { about } from './about.js';

export const lang = { ping, reminder, errors, about } as const;

export { formatPermissionErrors } from './errors.js';
