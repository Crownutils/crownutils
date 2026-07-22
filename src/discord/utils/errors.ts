import type { Container } from '../components/index.js';
import { createContainer, Text } from '../components/index.js';

/**
 * Normalise an unknown thrown value into an `Error`, so logging always receives
 * a real error object (with a stack) instead of a bare string or object.
 * `catch` clauses type their binding as `unknown`; this is the single funnel
 * that turns that back into something loggable.
 */
export function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  return new Error(typeof value === 'string' ? value : String(value));
}

/** Red container holding a single error message. */
export function buildErrorContainer(message: string): Container {
  return createContainer('cancel').add(new Text(message));
}

/** Green container holding a single success message. */
export function buildSuccessContainer(message: string): Container {
  return createContainer('success').add(new Text(message));
}
