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
