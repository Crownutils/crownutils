import { prisma } from '../persistence/client.js';
import type { Rank } from '../permissions/index.js';
import { hashUserId } from '../security/hash-user-id.js';
import type { SupportedLocale } from '../types.js';
import { hasBanHash } from './banned-repository.js';
import {
  getLegalAcceptance,
  type LegalAcceptanceRecord,
} from './legal-repository.js';
import { getUserLanguage, getUserRank } from './user-repository.js';

/** Minimum number of days a user must wait between two GDPR access requests. */
export const GDPR_REQUEST_COOLDOWN_DAYS = 31;

/** Everything the bot holds on a user, as returned by the GDPR access-request command. */
export interface GdprExport {
  readonly userId: string;
  readonly language: SupportedLocale;
  readonly rank: Rank;
  readonly legalAcceptance: LegalAcceptanceRecord | null;
  readonly hasBanHash: boolean;
}

/** Assembles `userId`'s {@link GdprExport} by reading every repository that stores something about them. */
export async function buildGdprExport(userId: string): Promise<GdprExport> {
  const [language, rank, legalAcceptance, banHash] = await Promise.all([
    getUserLanguage(userId),
    getUserRank(userId),
    getLegalAcceptance(userId),
    hasBanHash(userId),
  ]);

  return { userId, language, rank, legalAcceptance, hasBanHash: banHash };
}

/**
 * `userId`'s last recorded GDPR access request, or `null` if they never made
 * one. Keyed by hash (like {@link hasBanHash}) so the cooldown survives a data
 * erasure - otherwise a user could reset it by deleting their data and
 * requesting again immediately.
 */
export async function getLastGdprRequestAt(
  userId: string,
): Promise<Date | null> {
  const request = await prisma.gdprRequest.findUnique({
    where: { hash: hashUserId(userId) },
    select: { requestedAt: true },
  });
  return request?.requestedAt ?? null;
}

/** Records that `userId` just made a GDPR access request, resetting their cooldown. */
export async function recordGdprRequest(userId: string): Promise<void> {
  const hash = hashUserId(userId);
  await prisma.gdprRequest.upsert({
    where: { hash },
    create: { hash },
    update: { requestedAt: new Date() },
  });
}

/**
 * The date `userId` may next request their data, or `null` if they can request
 * it right now. Based on the {@link GDPR_REQUEST_COOLDOWN_DAYS}-day cooldown.
 */
export async function getNextGdprRequestEligibleAt(
  userId: string,
): Promise<Date | null> {
  const lastRequestAt = await getLastGdprRequestAt(userId);
  if (!lastRequestAt) return null;

  const eligibleAt = new Date(lastRequestAt);
  eligibleAt.setDate(eligibleAt.getDate() + GDPR_REQUEST_COOLDOWN_DAYS);

  return eligibleAt > new Date() ? eligibleAt : null;
}
