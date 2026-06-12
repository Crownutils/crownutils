import { lang } from '@/discord/lang/index.js';
import { PERMISSION_LABELS } from '@/discord/lang/permissions.js';
import { Container, Separator, Text } from '@/discord/components/index.js';
import { icons } from '@/discord/icons.js';
import {
  resolveAuthorization,
  AUTHORIZATION_LEVELS,
} from '@/core/permissions/authorization.js';
import type { CommandAuthorization } from '@/core/permissions/types.js';

const GRADE_ICONS = {
  owner: icons.crown,
  privileged: icons.ticket,
  public: icons.worldMap,
} as const satisfies Record<CommandAuthorization, string>;

export function buildGradeContainer(userId: string): Container {
  const userGrade = resolveAuthorization(userId);
  const userGradeDisplay = PERMISSION_LABELS[userGrade];
  const gradeRank = AUTHORIZATION_LEVELS[userGrade];
  const gradeIcon = GRADE_ICONS[userGrade];

  return new Container()
    .color('info')
    .add(
      new Text(lang.commands.grade.messages.explication),
      new Separator(),
      new Text(
        lang.commands.grade.messages.userGrade(userGradeDisplay, gradeIcon),
      ).newLine(lang.commands.grade.messages.gradeRank(gradeRank)),
    );
}
