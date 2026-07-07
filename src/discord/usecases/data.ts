import {
  buildGdprExport,
  getNextGdprRequestEligibleAt,
  recordGdprRequest,
} from '@/core/repositories/index.js';
import type { SupportedLocale } from '@/core/types.js';
import type { CommandResponse } from '../interactions/index.js';
import {
  buildDataContainer,
  buildDataCooldownContainer,
} from '../presentations/index.js';

/** Whether `userId` is past the GDPR access-request cooldown and may run `data` now. */
export async function canRunDataCommand(userId: string): Promise<boolean> {
  return (await getNextGdprRequestEligibleAt(userId)) === null;
}

/** Response shown when `userId` hits the GDPR access-request cooldown gate. */
export async function runDataCommandGateDenied(
  userId: string,
  language: SupportedLocale,
): Promise<CommandResponse> {
  const eligibleAt = await getNextGdprRequestEligibleAt(userId);
  return {
    container: buildDataCooldownContainer(language, eligibleAt!),
    ephemeral: true,
  };
}

/**
 * Builds `userId`'s data export and records the request. Contains personal
 * data, so the response is always ephemeral (prefix front ignores this).
 */
export async function runDataCommand(
  userId: string,
  language: SupportedLocale,
): Promise<CommandResponse> {
  const gdprExport = await buildGdprExport(userId);
  await recordGdprRequest(userId);

  return {
    container: buildDataContainer(language, gdprExport),
    ephemeral: true,
  };
}
