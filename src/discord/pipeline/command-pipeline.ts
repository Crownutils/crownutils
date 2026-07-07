import type {
  CommandRequirements,
  CommandScope,
  Rank,
} from '@/core/permissions/index.js';
import { checkCommandRequirements } from '@/core/permissions/index.js';
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
  readonly rank: Rank;
  readonly maintenance: boolean;
}

/**
 * Front-specific callbacks injected by the slash and prefix events. The
 * pipeline decides *what* happens; the front decides *how* to communicate it
 * (interaction reply vs. message reply).
 */
export interface CommandPipelineHandlers {
  execute: () => Awaitable<void>;
  onBanned: () => Awaitable<void>;
  onMaintenance: () => Awaitable<void>;
  onScopeDenied: (scope: CommandScope) => Awaitable<void>;
  onPermissionDenied: () => Awaitable<void>;
  onUnexpectedError: (error: unknown) => Awaitable<void>;
  onLegalNotAccepted: () => Awaitable<unknown>;
  onSuccess?: () => Awaitable<void>;
}

/**
 * Single, declarative dispatch shared by both command fronts:
 * banned → maintenance → legal → requirements → execution.
 * This is the only place access rules live, so slash and prefix never drift.
 * The whole run is wrapped so a failing *denial* reply (not just `execute`)
 * still surfaces through `onUnexpectedError` instead of being lost.
 */
export async function runCommandPipeline(
  context: CommandPipelineContext,
  handlers: CommandPipelineHandlers,
): Promise<void> {
  try {
    if (context.rank === 'banned') {
      await handlers.onBanned();
      return;
    }

    if (context.maintenance && context.rank !== 'owner') {
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

    const check = checkCommandRequirements(context.requirements, {
      inGuild: context.inGuild,
      inMainGuild: context.inGuild && context.inMainGuild,
      rank: context.rank,
    });
    if (!check.ok) {
      if (check.error === 'scope') {
        await handlers.onScopeDenied(context.requirements.scope);
      } else {
        await handlers.onPermissionDenied();
      }
      return;
    }

    await handlers.execute();
    await handlers.onSuccess?.();
  } catch (error) {
    await handlers.onUnexpectedError(error);
  }
}
