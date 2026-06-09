import type {
  CommandAuthorization,
  CommandPermission,
  CommandRequirements,
  CommandScope,
  CommandValidation,
  ExecutionContext,
} from '@/types/command.js';
import {
  AUTHORIZATION_LEVELS,
  SCOPE_ALLOWED_CONTEXTS,
} from '@/lib/permissions.js';
import { env } from '@/lib/env.js';

function resolveExecutionContext(guildId: string | null): ExecutionContext {
  if (guildId === null) {
    return 'dm';
  }
  if (guildId === env.mainGuildId) {
    return 'main_guild';
  }
  return 'other_guild';
}

function resolveAuthorization(userId: string): CommandAuthorization {
  if (userId === env.ownerId) {
    return 'owner';
  }
  if (env.privilegedIds.includes(userId)) {
    return 'privileged';
  }
  return 'public';
}

export function checkCommandScope(
  requiredScope: CommandScope,
  guildId: string | null,
): CommandValidation {
  const context = resolveExecutionContext(guildId);
  const isAllowed = SCOPE_ALLOWED_CONTEXTS[requiredScope].includes(context);

  return isAllowed
    ? { canBeExecuted: true, missingPermissions: [] }
    : { canBeExecuted: false, missingPermissions: [requiredScope] };
}

export function checkCommandAuthorization(
  requiredAuthorization: CommandAuthorization,
  userId: string,
): CommandValidation {
  const currentAuthorization = resolveAuthorization(userId);
  const isAllowed =
    AUTHORIZATION_LEVELS[currentAuthorization] >=
    AUTHORIZATION_LEVELS[requiredAuthorization];

  return isAllowed
    ? { canBeExecuted: true, missingPermissions: [] }
    : { canBeExecuted: false, missingPermissions: [requiredAuthorization] };
}

export function checkCommandRequirements(
  commandRequirements: CommandRequirements,
  guildId: string | null,
  userId: string,
): CommandValidation {
  const missingPermissions: CommandPermission[] = [];

  if (commandRequirements.scope) {
    const scopeValidation = checkCommandScope(
      commandRequirements.scope,
      guildId,
    );
    if (!scopeValidation.canBeExecuted) {
      missingPermissions.push(...scopeValidation.missingPermissions);
    }
  }

  if (commandRequirements.authorization) {
    const authorizationValidation = checkCommandAuthorization(
      commandRequirements.authorization,
      userId,
    );
    if (!authorizationValidation.canBeExecuted) {
      missingPermissions.push(...authorizationValidation.missingPermissions);
    }
  }

  return {
    canBeExecuted: missingPermissions.length === 0,
    missingPermissions,
  };
}
