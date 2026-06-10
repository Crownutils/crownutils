import { lang } from '@/lang/index.js';
import { PERMISSION_LABELS } from '@/lang/permissions.js';
import { Container, Separator, Text } from '@/lib/components/index.js';
import {
  AUTHORIZATION_LEVELS,
  resolveAuthorization,
} from '@/lib/permissions/authorization.js';
import { PrefixCommand } from '@/types/command/command.js';

export const command = {
  name: 'grade',
  description: lang.commands.grade.commandDescription,
  aliases: ['permission', 'rank'],
  requirements: {
    scope: 'global',
  },

  async execute(message, _args) {
    const userGrade = resolveAuthorization(message.author.id);
    const userGradeDisplay = PERMISSION_LABELS[userGrade];
    const gradeRank = AUTHORIZATION_LEVELS[userGrade];

    const reply = new Container()
      .color('info')
      .add(
        new Text(lang.commands.grade.description.explication),
        new Separator(),
        new Text(
          lang.commands.grade.description.userGrade(userGradeDisplay),
        ).newLine(lang.commands.grade.description.gradeRank(gradeRank)),
      )
      .build();

    await message.reply(reply);
  },
} satisfies PrefixCommand;
