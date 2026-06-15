import { PREFIX } from '@/discord/constants.js';
import { lang } from '@/discord/lang/index.js';
import { attachReminderCancelCollector } from '@/discord/interactions/reminder-cancel.js';
import { runRemindCommand } from '@/discord/reminders/remind-command.js';
import { DEFAULT_REMINDER_DURATION } from '@/discord/reminders/reminder-bridge.js';
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

    const { container, reminder } = await runRemindCommand({
      client: message.client,
      channelId: message.channelId,
      userId: message.author.id,
      durationInput,
      remindMessage,
      invalidFormatText: lang.commands.remind.messages.invalidFormat.prefix,
    });

    const sent = await message.reply(container.build());
    if (reminder) {
      attachReminderCancelCollector(sent, reminder);
    }
  },
} satisfies PrefixCommand;
