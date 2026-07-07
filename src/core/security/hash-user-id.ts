import { createHash } from 'node:crypto';
import { config } from '../config/index.js';

/**
 * Deterministic, salted, one-way hash of a Discord user id. Used to key
 * records that must survive a user's data erasure (bans, request cooldowns)
 * without keeping their plain Discord id around indefinitely.
 */
export function hashUserId(userId: string): string {
  return createHash('sha256')
    .update(userId + config.saltKey)
    .digest('hex');
}
