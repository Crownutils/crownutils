import type {
  CommandAuthorization,
  CommandPermission,
  CommandRequirements,
  CommandScope,
  CommandValidation,
} from '@/types/command.js';
import { AUTHORIZATION_LEVELS, SCOPE_LEVELS } from '@/types/command.js';

export function checkCommandScope(
  requiredScope: CommandScope,
  guildId: string | null,
): CommandValidation {
  const currentScope: CommandScope =
    guildId === null
      ? 'everywhere'
      : guildId === process.env.MAIN_GUILD_ID
        ? 'main_guild_only'
        : 'global';

  const currentScopeLevel = SCOPE_LEVELS[currentScope];
  const requiredScopeLevel = SCOPE_LEVELS[requiredScope];

  if (currentScopeLevel >= requiredScopeLevel) {
    return {
      canBeExecuted: true,
      missing_permissions: [],
    };
  }

  return {
    canBeExecuted: false,
    missing_permissions: [requiredScope],
  };
}

export function checkCommandAuthorization(
  requiredAuthorization: CommandAuthorization,
  userId: string,
): CommandValidation {
  const currentAuthorization: CommandAuthorization =
    userId === process.env.OWNER_ID
      ? 'owner'
      : process.env.PRIVILEGED_IDS?.split(',').filter(Boolean).includes(userId)
        ? 'privileged'
        : 'public';

  const currentAuthorizationLevel = AUTHORIZATION_LEVELS[currentAuthorization];
  const requiredAuthorizationLevel =
    AUTHORIZATION_LEVELS[requiredAuthorization];

  if (currentAuthorizationLevel >= requiredAuthorizationLevel) {
    return {
      canBeExecuted: true,
      missing_permissions: [],
    };
  }

  return {
    canBeExecuted: false,
    missing_permissions: [requiredAuthorization],
  };
}

export function checkCommandRequirements(
  commandRequirements: CommandRequirements,
  guildId: string | null,
  userId: string,
): CommandValidation {
  const missing_permissions: CommandPermission[] = [];

  const isScopeValid: CommandValidation = commandRequirements.scope
    ? checkCommandScope(commandRequirements.scope, guildId)
    : { canBeExecuted: true, missing_permissions: [] };
  const isAuthorizationValid: CommandValidation =
    commandRequirements.authorizations
      ? checkCommandAuthorization(commandRequirements.authorizations, userId)
      : { canBeExecuted: true, missing_permissions: [] };

  if (!isScopeValid.canBeExecuted) {
    missing_permissions.push(...isScopeValid.missing_permissions);
  }

  if (!isAuthorizationValid.canBeExecuted) {
    missing_permissions.push(...isAuthorizationValid.missing_permissions);
  }

  return {
    canBeExecuted:
      isScopeValid.canBeExecuted && isAuthorizationValid.canBeExecuted,
    missing_permissions,
  };
}
