import { logger } from '@/shared/index.js';
import { toError } from '@/discord/utils/errors.js';

/** Key-value context attached to the failure log (at least an `action` name). */
export type SafeDiscordContext = Record<string, unknown>;

/**
 * Wrap a best-effort Discord API call: on failure, log a warning with context
 * and resolve to `undefined` instead of throwing. Use it for calls whose
 * failure must not abort the surrounding flow (e.g. a courtesy error reply).
 */
export async function safeDiscord<T>(
  operation: Promise<T>,
  context: SafeDiscordContext,
): Promise<T | undefined> {
  try {
    return await operation;
  } catch (error) {
    logger.warn({ err: toError(error), ...context }, 'Discord call failed');
    return undefined;
  }
}
