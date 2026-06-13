import { PREFIX } from '@/discord/constants.js';
import { lang } from '@/discord/lang/index.js';
import { buildGradeContainer } from '@/discord/presentations/grade-presentation.js';
import type { PrefixCommand } from '@/discord/types/command.js';

/** `c!grade` (aliases `permission`, `rank`): shows the caller's permission grade. */
export const command = {
  name: 'grade',
  description: lang.commands.grade.commandDescription,
  aliases: ['permission', 'rank'],
  requirements: {
    scope: 'global',
  },
  help: {
    usagePrefix: `${PREFIX}grade`,
  },

  async execute(message, _args) {
    const reply = buildGradeContainer(message.author.id).build();

    await message.reply(reply);
  },
} satisfies PrefixCommand;
