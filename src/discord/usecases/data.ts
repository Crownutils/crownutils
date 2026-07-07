import {
  buildGdprExport,
  getNextGdprRequestEligibleAt,
  recordGdprRequest,
} from '@/core/repositories/index.js';
import { isOwner } from '@/core/permissions/index.js';
import type { SupportedLocale } from '@/core/types.js';
import type { CommandResponse } from '../interactions/index.js';
import {
  buildDataContainer,
  buildDataCooldownContainer,
} from '../presentations/index.js';

/**
 * Runs the `data` command: builds `userId`'s export and records the request, or
 * returns a cooldown notice if they made a request too recently. The owner is
 * exempt from the cooldown. The eligibility is checked once here (no gate), so
 * the notice carries the exact `eligibleAt` without a second query. Contains
 * personal data, so the command is `dm`-scoped and the slash reply is ephemeral.
 */
export async function runDataCommand(
  userId: string,
  language: SupportedLocale,
): Promise<CommandResponse> {
  if (!isOwner(userId)) {
    const eligibleAt = await getNextGdprRequestEligibleAt(userId);
    if (eligibleAt !== null) {
      return {
        container: buildDataCooldownContainer(language, eligibleAt),
        ephemeral: true,
      };
    }
  }

  const gdprExport = await buildGdprExport(userId);
  await recordGdprRequest(userId);

  return {
    container: buildDataContainer(language, gdprExport),
    ephemeral: true,
  };
}
