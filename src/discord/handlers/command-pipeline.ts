import {
  checkCommandRequirements,
  resolveAuthorization,
  resolveExecutionContext,
} from '@/core/permissions/index.js';
import type {
  CommandPermissionError,
  CommandRequirements,
} from '@/core/permissions/types.js';
import { isMaintenanceEnabled } from '@/core/maintenance/maintenance-repository.js';
import {
  LEGAL_GATE_EXEMPT_COMMANDS,
  mustAcceptLegal,
} from '@/core/legal/legal-repository.js';

/** Identifies the invoking user, the command, and where it was invoked from. */
export interface CommandPipelineContext {
  userId: string;
  commandName: string;
  guildId: string | null;
  requirements?: CommandRequirements;
}

/** Format-specific callbacks invoked at each step of {@link runCommandPipeline}. */
export interface CommandPipelineHandlers {
  execute: () => Promise<void>;
  onMaintenance: () => Promise<unknown>;
  /** Runs when the user hasn't accepted the legal documents yet. */
  onLegalNotAccepted: () => Promise<unknown>;
  onPermissionDenied: (errors: CommandPermissionError[]) => Promise<unknown>;
  onUnexpectedError: (error: unknown) => Promise<unknown>;
  /** Runs after a successful `execute` (e.g. the unread-mail reminder). */
  onExecuted?: () => Promise<unknown>;
}

/**
 * Shared dispatch sequence for prefix and slash commands: maintenance check,
 * then legal acceptance, then permission requirements, then execution with
 * error handling. Owners bypass both the maintenance check and the legal gate;
 * everyone else must accept the legal documents, except for the
 * {@link LEGAL_GATE_EXEMPT_COMMANDS}.
 */
export async function runCommandPipeline(
  context: CommandPipelineContext,
  handlers: CommandPipelineHandlers,
): Promise<void> {
  const userAuthorization = resolveAuthorization(context.userId);

  if (userAuthorization !== 'owner' && (await isMaintenanceEnabled())) {
    await handlers.onMaintenance();
    return;
  }

  if (
    !LEGAL_GATE_EXEMPT_COMMANDS.has(context.commandName) &&
    (await mustAcceptLegal(context.userId))
  ) {
    await handlers.onLegalNotAccepted();
    return;
  }

  if (context.requirements) {
    const validation = checkCommandRequirements(
      context.requirements,
      resolveExecutionContext(context.guildId),
      userAuthorization,
    );

    if (!validation.canBeExecuted) {
      await handlers.onPermissionDenied(validation.errors);
      return;
    }
  }

  try {
    await handlers.execute();
  } catch (error) {
    await handlers.onUnexpectedError(error);
    return;
  }

  await handlers.onExecuted?.();
}
