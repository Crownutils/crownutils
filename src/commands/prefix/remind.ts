import { lang } from '@/lang/index.js';
import { buildErrorContainer } from '@/lib/errors.js';
import { buildReminderCreatedContainer } from '@/lib/reminder-presentation.js';
import { attachReminderCancelCollector } from '@/interactions/reminder-cancel.js';
import {
  DEFAULT_REMINDER_DURATION,
  MAX_REMINDERS_PER_USER,
  createReminderFromInput,
} from '@/services/reminder-service.js';
import type { PrefixCommand } from '@/types/command/command.js';

function getReminderArgs(args: string[]): {
  durationInput: string;
  remindMessage: string;
} {
  if (args.length === 0) {
    return {
      durationInput: DEFAULT_REMINDER_DURATION,
      remindMessage: lang.reminder.messages.defaultMessage,
    };
  }

  const [durationInput, ...rest] = args;
  return {
    durationInput: durationInput ?? '',
    remindMessage: rest.join(' '),
  };
}

export const command = {
  name: 'remind',
  description: lang.reminder.description,
  aliases: ['r', 'rm', 'remindme', 'rappel'],
  requirements: {
    scope: 'global',
  },

  async execute(message, args) {
    const { durationInput, remindMessage } = getReminderArgs(args);

    const result = await createReminderFromInput(
      message.client,
      message.channelId,
      message.author.id,
      durationInput,
      remindMessage,
    );

    if (!result.ok) {
      const errorText = {
        invalid_format: lang.reminder.messages.invalidFormat.prefix,
        duration_too_long: lang.reminder.messages.durationTooLong,
        limit_reached: lang.reminder.messages.limitReached({
          max: MAX_REMINDERS_PER_USER,
        }),
      };
      await message.reply(buildErrorContainer(errorText[result.error]).build());
      return;
    }

    const sent = await message.reply(
      buildReminderCreatedContainer(result.reminder).build(),
    );
    attachReminderCancelCollector(sent, result.reminder);
  },
} satisfies PrefixCommand;
