import type { CommandPermissionError } from '@/core/permissions/types.js';
import { formatPermissionErrors } from '@/discord/lang/index.js';
import { Container, Text } from './components/index.js';

export function buildErrorContainer(message: string): Container {
  return new Container().color('error').add(new Text(message));
}

export function buildCommandPermissionsErrorContainer(
  permissionErrors: CommandPermissionError[],
): Container {
  return buildErrorContainer(formatPermissionErrors(permissionErrors));
}
