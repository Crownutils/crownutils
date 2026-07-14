import { COMMAND_PREFIX } from '@/discord/utils/constants.js';
import { icons } from '@/discord/theme/icons.js';
import { md } from '@/discord/theme/markdown.js';
import type { CommandNode } from '../types.js';

export const remind = {
  description: 'Set a reminder.',
  messages: {
    timeOption: 'How long until the reminder. E.g. 1h30m, 30s.',
    messageOption: 'The reminder message.',
    defaultMessage: 'Crownicles report',
    created: {
      title: 'Reminder set',
      cancelButton: 'Cancel this reminder',
      description: (message: string, when: string): string =>
        `Your reminder for ${md.code(message)} is set for ${when}.`,
    },
    cancelled: {
      title: 'Reminder cancelled',
      description: (message: string): string =>
        `Your reminder for ${md.code(message)} has been cancelled.`,
    },
    triggered: {
      title: `${icons.bell} DRING!`,
      relaunchButton: 'Relaunch',
    },
    durationTooLong: 'A reminder cannot be scheduled more than 10 years ahead.',
    limitReached: (max: number): string =>
      `You have reached the limit of ${max} simultaneous reminders.`,
    invalidFormat: {
      prefix: `Invalid format. Examples: ${md.code(`${COMMAND_PREFIX}r`)}, ${md.code(`${COMMAND_PREFIX}r 1h30m buy groceries`)}.`,
      slash: `Invalid format. Examples: ${md.code('/remind')}, ${md.code('/remind time:1h30m message:buy groceries')}.`,
    },
  },
} as const satisfies CommandNode;
