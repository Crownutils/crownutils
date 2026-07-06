import { config } from '@/core/config/index.js';

/** Whether a user id is the configured bot owner. */
export function isOwner(userId: string): boolean {
  return userId === config.ownerDiscordId;
}
