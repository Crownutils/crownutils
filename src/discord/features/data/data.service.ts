import {
  buildGdprExport,
  getNextGdprRequestEligibleAt,
  isGdprExportEmpty,
  recordGdprRequest,
  type GdprExport,
} from '@/core/repositories/index.js';
import { isOwner } from '@/core/permissions/index.js';
import type { SupportedLocale } from '@/core/types.js';
import {
  sendResponseToDM,
  sendResponseToInteraction,
  type CommandResponse,
} from '../../interactions/index.js';
import type { InteractiveMessage } from '../../interactions/index.js';
import {
  buildDataContainer,
  buildDataCooldownContainer,
  buildDataLookupPickerContainer,
} from './data.ui.js';
import { buildGdprExportFiles } from './data.export.js';
import {
  buildErrorContainer,
  buildSuccessContainer,
} from '@/discord/utils/errors.js';
import { lang } from '@/discord/lang/index.js';
import type { User } from 'discord.js';

/**
 * A subject's export as a response: the short notice plus the two downloadable
 * files it points at. Both fronts and the owner lookup go through here, so a
 * data answer is never assembled two different ways.
 */
function toExportResponse(
  gdprExport: GdprExport,
  language: SupportedLocale,
  ephemeral: boolean,
): CommandResponse {
  /**
   * An empty export gets the "nothing stored" card, which points at no file,
   * and Components V2 rejects an attachment no component references.
   */
  if (isGdprExportEmpty(gdprExport)) {
    return {
      container: buildDataContainer(language, gdprExport, []),
      ephemeral,
    };
  }

  const files = buildGdprExportFiles(gdprExport, language);
  return {
    container: buildDataContainer(language, gdprExport, files.names),
    files: files.attachments,
    ephemeral,
  };
}

/** Sends `response` by DM to `user` and returns a small confirmation/failure notice. */
async function deliverViaDM(
  user: User,
  response: CommandResponse,
  language: SupportedLocale,
): Promise<CommandResponse> {
  const sent = await sendResponseToDM(user, response);
  const t = lang[language].common;

  return {
    container: sent
      ? buildSuccessContainer(t.dmSuccess)
      : buildErrorContainer(t.dmFailed),
  };
}

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

  return toExportResponse(gdprExport, language, inGuild);
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
  return deliverViaDM(user, response, language);
}

/** Builds `targetId`'s data response, bypassing the cooldown - this is an admin lookup, not the target's own request. */
async function buildTargetDataResponse(
  targetId: string,
  language: SupportedLocale,
): Promise<CommandResponse> {
  const gdprExport = await buildGdprExport(targetId);
  return toExportResponse(gdprExport, language, true);
}

/**
 * Owner-only: looks up `targetId`'s data, replied ephemerally - used by the
 * slash front, where ephemeral is already private enough on its own.
 */
export async function runDataLookupCommand(
  targetId: string,
  language: SupportedLocale,
): Promise<CommandResponse> {
  return buildTargetDataResponse(targetId, language);
}

/**
 * Owner-only: looks up `targetId`'s data and DMs it to `requester` (the
 * owner) - used by the prefix front, which has no ephemeral replies. Returns
 * a small confirmation or failure notice meant for the invoking channel.
 */
export async function runDataLookupCommandViaDM(
  targetId: string,
  language: SupportedLocale,
  requester: User,
): Promise<CommandResponse> {
  const response = await buildTargetDataResponse(targetId, language);
  return deliverViaDM(requester, response, language);
}

/** Owner-only user picker for the prefix front; replies ephemerally per pick, stays open for more. */
export function createDataLookupController(
  ownerId: string,
  language: SupportedLocale,
): InteractiveMessage<null> {
  return {
    initialState: null,
    allowedIds: [ownerId],

    render(_state, { disabled }) {
      return buildDataLookupPickerContainer(language, disabled);
    },

    async reduce(state, interaction, context) {
      if (!interaction.isUserSelectMenu()) return state;
      const [targetId] = interaction.values;
      if (targetId === undefined) return state;

      const response = await buildTargetDataResponse(targetId, language);
      await sendResponseToInteraction(interaction, response);
      context.markHandled();
      return state;
    },
  };
}
