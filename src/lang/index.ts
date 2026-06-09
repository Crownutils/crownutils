import { ping } from './ping.js';
import { reminder } from './reminder.js';
import { errors } from './errors.js';

export const lang = { ping, reminder, errors } as const;

export { formatMissingPermissions } from './errors.js';
