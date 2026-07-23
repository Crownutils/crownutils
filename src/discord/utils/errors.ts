import type { Container } from '../components/index.js';
import { createContainer, Text } from '../components/index.js';

/** Normalizes an unknown caught value into a real `Error`, so logs always get a stack. */
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
