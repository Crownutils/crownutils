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

/** Identifies the invoking user and where the command was invoked from. */
export interface CommandPipelineContext {
  userId: string;
  guildId: string | null;
  requirements?: CommandRequirements;
}

/** Format-specific callbacks invoked at each step of {@link runCommandPipeline}. */
export interface CommandPipelineHandlers {
  execute: () => Promise<void>;
  onMaintenance: () => Promise<unknown>;
  onPermissionDenied: (errors: CommandPermissionError[]) => Promise<unknown>;
  onUnexpectedError: (error: unknown) => Promise<unknown>;
}

/**
 * Shared dispatch sequence for prefix and slash commands: maintenance check,
 * then permission requirements, then execution with error handling. Owners
 * bypass the maintenance check.
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
  }
}
