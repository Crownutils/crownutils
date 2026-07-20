import type { EventModule, PrefixCommand, SlashCommand } from './types.js';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasRequirements(value: Record<string, unknown>): boolean {
  const requirements = value.requirements;
  return (
    isObject(requirements) &&
    typeof requirements.scope === 'string' &&
    typeof requirements.authorization === 'string'
  );
}

/** Complete structural check that a dynamically imported module is a slash command. */
export function isSlashCommand(value: unknown): value is SlashCommand {
  if (!isObject(value)) return false;
  const data = value.data;
  return (
    isObject(data) &&
    typeof data.name === 'string' &&
    typeof data.toJSON === 'function' &&
    hasRequirements(value) &&
    typeof value.execute === 'function'
  );
}

/** Complete structural check that a module is a prefix command. */
export function isPrefixCommand(value: unknown): value is PrefixCommand {
  if (!isObject(value)) return false;
  return (
    typeof value.name === 'string' &&
    hasRequirements(value) &&
    typeof value.execute === 'function'
  );
}

/** Complete structural check that a module is an event module. */
export function isEventModule(value: unknown): value is EventModule {
  if (!isObject(value)) return false;
  return typeof value.name === 'string' && typeof value.execute === 'function';
}
