import { userMention } from 'discord.js';
import { collectUserData, consumeDataAccess } from '@/core/legal/data-rights.js';
import { resolveAuthorization } from '@/core/permissions/index.js';
import type { Container } from '@/discord/components/index.js';
import {
  buildDataContainer,
  buildDataCooldownContainer,
} from '@/discord/presentations/data-presentation.js';

/**
 * Shared `/data` logic: enforces the once-per-31-days access throttle for the
 * caller, then builds either the cooldown refusal or the data export. The bot
 * owner may pass `requestedTargetId` to inspect another user's data and is
 * exempt from the throttle; for anyone else the requested target is ignored.
 */
export async function runDataCommand(
  callerId: string,
  requestedTargetId?: string,
): Promise<Container> {
  const callerIsOwner = resolveAuthorization(callerId) === 'owner';
  const targetId =
    callerIsOwner && requestedTargetId ? requestedTargetId : callerId;

  const access = await consumeDataAccess(callerId);
  if (!access.allowed) {
    return buildDataCooldownContainer(access.nextEligibleAt);
  }

  const snapshot = await collectUserData(targetId);
  return buildDataContainer(snapshot, {
    mention: targetId === callerId ? undefined : userMention(targetId),
    exempt: resolveAuthorization(targetId) === 'owner',
  });
}
