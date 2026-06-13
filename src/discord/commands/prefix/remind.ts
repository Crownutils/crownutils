import { PREFIX } from '@/discord/constants.js';
import { lang } from '@/discord/lang/index.js';
import { buildErrorContainer } from '@/discord/errors.js';
import { buildReminderCreatedContainer } from '@/discord/presentations/reminder-presentation.js';
import { attachReminderCancelCollector } from '@/discord/interactions/reminder-cancel.js';
import {
  DEFAULT_REMINDER_DURATION,
  createReminderFromInput,
  getMaxRemindersForUser,
} from '@/discord/reminders/reminder-bridge.js';
import type { PrefixCommand } from '@/discord/types/command.js';

function getReminderArgs(args: string[]): {
  durationInput: string;
  remindMessage: string;
} {
  if (args.length === 0) {
    return {
      durationInput: DEFAULT_REMINDER_DURATION,
      remindMessage: lang.commands.remind.messages.defaultMessage,
    };
  }

  const [durationInput, ...rest] = args;
  return {
    durationInput: durationInput ?? '',
    remindMessage: rest.join(' '),
  };
}

/** `c!remind [durée] [message]` (aliases `r`, `rm`, `remindme`, `rappel`): creates a reminder. */
export const command = {
  name: 'remind',
  description: lang.commands.remind.commandDescription,
  aliases: ['r', 'rm', 'remindme', 'rappel'],
  requirements: {
    scope: 'global',
  },
  help: {
    usagePrefix: `${PREFIX}remind [durée] [message]`,
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
        invalid_format: lang.commands.remind.messages.invalidFormat.prefix,
        duration_too_long: lang.commands.remind.messages.durationTooLong,
        limit_reached: lang.commands.remind.messages.limitReached({
          max: getMaxRemindersForUser(message.author.id),
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
