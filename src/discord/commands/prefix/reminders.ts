import { PREFIX } from '@/discord/constants.js';
import { lang } from '@/discord/lang/index.js';
import { attachReminderListCollector } from '@/discord/interactions/reminder-list.js';
import { runRemindersCommand } from '@/discord/reminders/reminders-command.js';
import type { PrefixCommand } from '@/discord/types/command.js';

/** `c!reminders` (alias `rl`): lists the caller's reminders with delete buttons. */
export const command = {
  name: 'reminders',
  description: lang.commands.reminders.commandDescription,
  aliases: ['rl'],
  requirements: {
    scope: 'global',
  },
  help: {
    usagePrefix: `${PREFIX}reminders`,
  },

  async execute(message, _args) {
    const { container, reminders } = await runRemindersCommand(
      message.author.id,
    );
    const sent = await message.reply(container.build());
    attachReminderListCollector(sent, message.author.id, reminders);
  },
} satisfies PrefixCommand;
