import type { CommandPermissionError } from '@/core/permissions/types.js';
import { formatPermissionErrors } from '@/discord/lang/index.js';
import { Container, Text } from './components/index.js';
import { logger } from '@/shared/logger.js';

/** Builds a red error container with `message`. */
export function buildErrorContainer(message: string): Container {
  return new Container().color('error').add(new Text(message));
}

/** Builds an error container summarizing failed command permission checks. */
export function buildCommandPermissionsErrorContainer(
  permissionErrors: CommandPermissionError[],
): Container {
  return buildErrorContainer(formatPermissionErrors(permissionErrors));
}

/** Runs a best-effort Discord call, logging (not throwing) on failure. */
export async function safeDiscord<T>(
  action: Promise<T>,
  context: string,
): Promise<T | undefined> {
  try {
    return await action;
  } catch (error) {
    logger.warn({ error, context }, 'Best-effort Discord call failed.');
    return undefined;
  }
}
