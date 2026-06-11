import { lang } from '@/lang/index.js';
import { buildGradeContainer } from '@/services/presentations/grade-presentation.js';
import type { PrefixCommand } from '@/types/command/command.js';

export const command = {
  name: 'grade',
  description: lang.commands.grade.commandDescription,
  aliases: ['permission', 'rank'],
  requirements: {
    scope: 'global',
  },

  async execute(message, _args) {
    const reply = buildGradeContainer(message.author.id).build();

    await message.reply(reply);
  },
} satisfies PrefixCommand;
