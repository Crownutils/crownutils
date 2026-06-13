import type {
  CommandAuthorization,
  CommandPermissionError,
  CommandRequirements,
  CommandScope,
  CommandValidation,
  ExecutionContext,
} from './types.js';
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

/**
 * Checks a command's scope and authorization requirements against the
 * current execution context and user, collecting every failed check.
 */
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
