import { prisma } from '../persistence/client.js';
import { hashUserId } from '../security/hash-user-id.js';
import type { Rank, SupportedLocale } from '../types.js';
import { hasBanHash } from './banned-repository.js';
import {
  deleteLegalAcceptance,
  getLegalAcceptance,
  type LegalAcceptanceRecord,
} from './legal-repository.js';
import {
  deleteAllUserReminders,
  listRemindersForGdpr,
  type GdprReminder,
} from './reminder-repository.js';
import { deleteUser, findStoredUserProfile } from './user-repository.js';

/** Minimum number of days a user must wait between two GDPR access requests. */
export const GDPR_REQUEST_COOLDOWN_DAYS = 31;

/** Everything the bot holds on a user, as returned by the GDPR access-request command. */
export interface GdprExport {
  readonly userId: string;
  /** `null` when there is no `User` row at all - distinct from a stored value. */
  readonly language: SupportedLocale | null;
  /** `null` when there is no `User` row at all - distinct from a stored value. */
  readonly rank: Rank | null;
  readonly legalAcceptance: LegalAcceptanceRecord | null;
  readonly hasBanHash: boolean;
  /** Every reminder stored for the user, any status; empty when none. */
  readonly reminders: readonly GdprReminder[];
}

/**
 * Assembles `userId`'s {@link GdprExport} by reading every repository that
 * stores something about them. Reads the `User` row directly rather than
 * through {@link getUserProfile}, whose cache would otherwise fabricate and
 * cache `en`/`normal` defaults for someone with no row - which this export
 * must not report as if it were real stored data.
 */
export async function buildGdprExport(userId: string): Promise<GdprExport> {
  const [profile, legalAcceptance, banHash, reminders] = await Promise.all([
    findStoredUserProfile(userId),
    getLegalAcceptance(userId),
    hasBanHash(userId),
    listRemindersForGdpr(userId),
  ]);

  return {
    userId,
    language: profile?.language ?? null,
    rank: profile?.rank ?? null,
    legalAcceptance,
    hasBanHash: banHash,
    reminders,
  };
}

/** What a {@link eraseUserData} call removed, for the confirmation summary. */
export interface GdprErasureSummary {
  readonly deletedUserRow: boolean;
  readonly deletedLegalAcceptance: boolean;
  readonly deletedReminders: number;
}

/** Whether the bot stores any erasable data for `userId` (the ban hash and GDPR cooldown are not erasable). */
export async function hasErasableUserData(userId: string): Promise<boolean> {
  const data = await buildGdprExport(userId);
  return (
    data.language !== null ||
    data.rank !== null ||
    data.legalAcceptance !== null ||
    data.reminders.length > 0
  );
}

/**
 * Erases everything the bot stores about `userId` for a right-to-erasure
 * request: their profile row, legal acceptance and reminders. The ban hash and
 * the GDPR request cooldown are deliberately kept - both are keyed by hash and
 * must survive an erasure (ban evasion, cooldown reset).
 */
export async function eraseUserData(
  userId: string,
): Promise<GdprErasureSummary> {
  const [deletedUserRow, deletedLegalAcceptance, deletedReminders] =
    await Promise.all([
      deleteUser(userId),
      deleteLegalAcceptance(userId),
      deleteAllUserReminders(userId),
    ]);
  return { deletedUserRow, deletedLegalAcceptance, deletedReminders };
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
