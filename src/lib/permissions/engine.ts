import type { ExecutionContext } from '@/types/command/command-context.js';
import type {
  CommandPermissionError,
  CommandValidation,
} from '@/types/command/command-permission.js';
import type {
  CommandAuthorization,
  CommandRequirements,
  CommandScope,
} from '@/types/command/command.js';
import { isScopeAllowed } from './scope.js';
import { isAuthorizationAllowed } from './authorization.js';

function checkCommandScope(
  requiredScope: CommandScope,
  context: ExecutionContext,
): { ok: boolean; commandPermissionError: CommandPermissionError } {
  const isAllowed = isScopeAllowed(requiredScope, context);
  const commandPermissionError: CommandPermissionError = {
    type: 'scope',
    required: requiredScope,
  };

  return isAllowed
    ? { ok: true, commandPermissionError }
    : { ok: false, commandPermissionError };
}

function checkCommandAuthorization(
  requiredAuthorization: CommandAuthorization,
  userAuthorization: CommandAuthorization,
): { ok: boolean; commandPermissionError: CommandPermissionError } {
  const isAllowed = isAuthorizationAllowed(
    requiredAuthorization,
    userAuthorization,
  );
  const commandPermissionError: CommandPermissionError = {
    type: 'authorization',
    required: requiredAuthorization,
    current: userAuthorization,
  };

  return isAllowed
    ? { ok: true, commandPermissionError }
    : { ok: false, commandPermissionError };
}

export function checkCommandRequirements(
  commandRequirements: CommandRequirements,
  context: ExecutionContext,
  userAuthorization: CommandAuthorization,
): CommandValidation {
  const errors: CommandPermissionError[] = [];

  if (commandRequirements.scope) {
    const scopeCheck = checkCommandScope(commandRequirements.scope, context);
    if (!scopeCheck.ok) {
      errors.push(scopeCheck.commandPermissionError);
    }
  }

  if (commandRequirements.authorization) {
    const authorizationCheck = checkCommandAuthorization(
      commandRequirements.authorization,
      userAuthorization,
    );
    if (!authorizationCheck.ok) {
      errors.push(authorizationCheck.commandPermissionError);
    }
  }

  return {
    canBeExecuted: errors.length === 0,
    errors,
  };
}
