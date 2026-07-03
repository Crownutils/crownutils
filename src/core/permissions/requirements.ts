import { err, ok, type Result } from '@/shared/index.js';
import {
  isAuthorized,
  type Authorization,
  type AuthorizationContext,
} from './authorization.js';
import {
  isScopeSatisfied,
  type CommandScope,
  type ScopeContext,
} from './scope.js';

/** The access rules a command declares once and both fronts enforce. */
export interface CommandRequirements {
  readonly scope: CommandScope;
  readonly authorization: Authorization;
}

/** Which requirement failed, lets the caller pick a distinct response. */
export type RequirementFailure = 'scope' | 'authorization';

export type RequirementContext = ScopeContext & AuthorizationContext;

/**
 * Single source of truth for command access. Returns a typed result instead of
 * throwing, and checks scope before authorization (so a DM-only command run in a
 * guild reports the location, not a permission, problem).
 */
export function checkCommandRequirements(
  requirements: CommandRequirements,
  context: RequirementContext,
): Result<void, RequirementFailure> {
  if (!isScopeSatisfied(requirements.scope, context)) {
    return err('scope');
  }
  if (!isAuthorized(requirements.authorization, context)) {
    return err('authorization');
  }

  return ok(undefined);
}
