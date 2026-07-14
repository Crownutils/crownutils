import { resolveUserContext } from '@/discord/context/user.js';
import {
  mountInteractiveMessage,
  sendResponseToMessage,
} from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import { DEFAULT_REMINDER_DURATION } from '@/discord/features/reminder/reminder.duration.js';
import {
  createReminderCancelController,
  runCreateReminder,
} from '@/discord/features/reminder/reminder.service.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const command = {
  name: 'remind',
  aliases: ['r', 'rm', 'remindme', 'rappel'],
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(message, args) {
    const { locale, rank } = await resolveUserContext(message.author.id);
    const t = lang[locale].commandRemind.messages;
    const noArgs = args.length === 0;

    const outcome = await runCreateReminder({
      userId: message.author.id,
      channelId: message.channelId,
      rank,
      locale,
      durationInput: noArgs ? DEFAULT_REMINDER_DURATION : (args[0] ?? ''),
      message: noArgs ? t.defaultMessage : args.slice(1).join(' '),
      invalidFormatText: t.invalidFormat.prefix,
    });

    if (!outcome.ok) {
      await sendResponseToMessage(message, { container: outcome.container });
      return;
    }

    if (message.channel.isSendable()) {
      await mountInteractiveMessage(
        message.channel,
        createReminderCancelController(
          outcome.reminder,
          message.author.id,
          locale,
        ),
      );
    }
  },
} satisfies PrefixCommand;

export default command;
