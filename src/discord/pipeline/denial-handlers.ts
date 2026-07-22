import type { SupportedLocale } from '@/core/types.js';
import { logger } from '@/shared/index.js';
import type { CommandResponse } from '../interactions/index.js';
import { lang } from '../lang/index.js';
import { buildErrorContainer, toError } from '../utils/errors.js';
import type { CommandPipelineHandlers } from './command-pipeline.js';

/** Deliver a pre-built response through whichever front (interaction/message) is in play. */
export type ReplyFn = (response: CommandResponse) => Promise<void>;

/** What {@link buildDenialHandlers} needs from the invoking front. */
export interface DenialHandlerParams {
  readonly locale: SupportedLocale;
  readonly commandName: string;
  /** Log message used when a command throws, e.g. `'Slash command failed'`. */
  readonly logLabel: string;
  readonly reply: ReplyFn;
}

/**
 * Builds every pipeline denial/error callback from a single transport-specific
 * `reply`, so the slash and prefix events share one wiring and can never drift.
 * Refusals ask for an ephemeral reply; the prefix front simply ignores that flag.
 */
export function buildDenialHandlers(
  params: DenialHandlerParams,
): Omit<CommandPipelineHandlers, 'execute'> {
  const { locale, commandName, logLabel, reply } = params;
  const t = lang[locale].common;

  const errorReply = (message: string): Promise<void> =>
    reply({ container: buildErrorContainer(message), ephemeral: true });

  return {
    onBanned: () => errorReply(t.banned),
    onMaintenance: () => errorReply(t.maintenance),
    onScopeDenied: (scope) => errorReply(t.scopeDenied(scope)),
    onPermissionDenied: () => errorReply(t.permissionDenied),
    onLegalNotAccepted: () => errorReply(t.legalNotAccepted),
    onUnexpectedError: async (error) => {
      logger.error({ err: toError(error), command: commandName }, logLabel);
      await errorReply(t.unexpectedError);
    },
  };
}
