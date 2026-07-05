import type {
  CommandRequirements,
  CommandScope,
} from '@/core/permissions/index.js';
import { checkCommandRequirements, isOwner } from '@/core/permissions/index.js';
import {
  hasAcceptedLegal,
  LEGAL_GATE_EXEMPT_COMMANDS,
} from '@/core/repositories/index.js';
import type { Awaitable } from 'discord.js';

/** Everything the pipeline needs to decide whether a command may run. */
export interface CommandPipelineContext {
  readonly commandName: string;
  readonly requirements: CommandRequirements;
  readonly inGuild: boolean;
  readonly inMainGuild: boolean;
  readonly userId: string;
  readonly ownerId: string;
  readonly privilegedIds: readonly string[];
  readonly maintenance: boolean;
}

/**
 * Front-specific callbacks injected by the slash and prefix events. The
 * pipeline decides *what* happens; the front decides *how* to communicate it
 * (interaction reply vs. message reply).
 */
export interface CommandPipelineHandlers {
  execute: () => Awaitable<void>;
  onMaintenance: () => Awaitable<void>;
  onScopeDenied: (scope: CommandScope) => Awaitable<void>;
  onPermissionDenied: () => Awaitable<void>;
  onUnexpectedError: (error: unknown) => Awaitable<void>;
  onLegalNotAccepted: () => Awaitable<unknown>;
  onSuccess?: () => Awaitable<void>;
  /** Optional extra gate (e.g. a feature flag); resolve `false` to block. */
  gate?: () => Awaitable<boolean>;
  onGateDenied?: () => Awaitable<void>;
}

/**
 * Single, declarative dispatch shared by both command fronts:
 * maintenance → optional gate → requirements → execution → post-success.
 * This is the only place access rules live, so slash and prefix never drift.
 */
export async function runCommandPipeline(
  context: CommandPipelineContext,
  handlers: CommandPipelineHandlers,
): Promise<void> {
  const isUserOwner = isOwner(context.userId, context.ownerId);

  if (context.maintenance && !isUserOwner) {
    await handlers.onMaintenance();
    return;
  }

  if (
    !(await hasAcceptedLegal(context.userId)) &&
    !LEGAL_GATE_EXEMPT_COMMANDS.has(context.commandName)
  ) {
    await handlers.onLegalNotAccepted();
    return;
  }

  if (handlers.gate && !(await handlers.gate())) {
    await handlers.onGateDenied?.();
    return;
  }

  const check = checkCommandRequirements(context.requirements, {
    inGuild: context.inGuild,
    inMainGuild: context.inGuild && context.inMainGuild,
    userId: context.userId,
    ownerId: context.ownerId,
    privilegedIds: context.privilegedIds,
  });
  if (!check.ok) {
    if (check.error === 'scope') {
      await handlers.onScopeDenied(context.requirements.scope);
    } else {
      await handlers.onPermissionDenied();
    }
    return;
  }

  try {
    await handlers.execute();
    await handlers.onSuccess?.();
  } catch (error) {
    await handlers.onUnexpectedError(error);
  }
}
