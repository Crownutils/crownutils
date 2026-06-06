import type { CommandPermission } from '@/types/command.js';
import { Container } from './components/container.js';
import { buildCommandPermissionsErrorReply } from '@/lang/errors.js';
import { Text } from './components/text.js';

export function buildCommandPermissionsErrorContainer(
  missing_permissions: CommandPermission[],
): Container {
  return new Container()
    .color('error')
    .add(new Text(buildCommandPermissionsErrorReply(missing_permissions)));
}
