import {
  buildGdprExport,
  getNextGdprRequestEligibleAt,
  recordGdprRequest,
} from '@/core/repositories/index.js';
import { isOwner } from '@/core/permissions/index.js';
import type { SupportedLocale } from '@/core/types.js';
import {
  sendResponseToDM,
  type CommandResponse,
} from '../../interactions/index.js';
import { buildDataContainer, buildDataCooldownContainer } from './data.ui.js';
import {
  buildErrorContainer,
  buildSuccessContainer,
} from '@/discord/utils/errors.js';
import { lang } from '@/discord/lang/index.js';
import type { User } from 'discord.js';

/**
 * Runs the `data` command: builds `userId`'s export and records the request, or
 * returns a cooldown notice if they made a request too recently. The owner is
 * exempt from the cooldown. The eligibility is checked once here (no gate), so
 * the notice carries the exact `eligibleAt` without a second query. `ephemeral`
 * only makes sense in a guild - already-private in a DM, where it is ignored.
 */
export async function runDataCommand(
  userId: string,
  language: SupportedLocale,
  inGuild: boolean,
): Promise<CommandResponse> {
  if (!isOwner(userId)) {
    const eligibleAt = await getNextGdprRequestEligibleAt(userId);
    if (eligibleAt !== null) {
      return {
        container: buildDataCooldownContainer(language, eligibleAt),
        ephemeral: inGuild,
      };
    }
  }

  const gdprExport = await buildGdprExport(userId);
  await recordGdprRequest(userId);

  return {
    container: buildDataContainer(language, gdprExport),
    ephemeral: inGuild,
  };
}

/**
 * Runs the `data` command and delivers it by DM instead of `ephemeral` - used
 * by the prefix front, which has no ephemeral replies. Returns a small
 * confirmation or failure notice meant for the channel the command was run in.
 */
export async function runDataCommandViaDM(
  userId: string,
  language: SupportedLocale,
  user: User,
): Promise<CommandResponse> {
  const response = await runDataCommand(userId, language, true);
  const sent = await sendResponseToDM(user, response);
  const t = lang[language].common;

  return {
    container: sent
      ? buildSuccessContainer(t.dmSuccess)
      : buildErrorContainer(t.dmFailed),
  };
}
