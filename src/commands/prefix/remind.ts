import { lang } from '@/lang/index.js';
import { buildErrorContainer } from '@/lib/errors.js';
import { buildReminderCreatedContainer } from '@/lib/reminder-presentation.js';
import {
  DEFAULT_REMINDER_DURATION,
  createReminderFromInput,
} from '@/services/reminder-service.js';
import type { PrefixCommand } from '@/types/command.js';

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

export const command: PrefixCommand = {
  name: 'remind',
  description: lang.reminder.description,
  aliases: ['r', 'rm', 'remindme', 'rappel'],

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
      const text =
        result.error === 'duration_too_long'
          ? lang.reminder.messages.durationTooLong
          : lang.reminder.messages.invalidFormat.prefix;
      await message.reply(buildErrorContainer(text).build());
      return;
    }

    await message.reply(buildReminderCreatedContainer(result.reminder).build());
  },
};
