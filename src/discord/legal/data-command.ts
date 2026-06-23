import { collectUserData, consumeDataAccess } from '@/core/legal/data-rights.js';
import type { Container } from '@/discord/components/index.js';
import {
  buildDataContainer,
  buildDataCooldownContainer,
} from '@/discord/presentations/data-presentation.js';

/**
 * Shared `/data` logic: enforces the once-per-31-days access throttle, then
 * builds either the cooldown refusal or the full data export.
 */
export async function runDataCommand(userId: string): Promise<Container> {
  const access = await consumeDataAccess(userId);
  if (!access.allowed) {
    return buildDataCooldownContainer(access.nextEligibleAt);
  }
  const snapshot = await collectUserData(userId);
  return buildDataContainer(snapshot);
}
