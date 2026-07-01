import type { LegalAcceptance } from '@/core/persistence/prisma/client.js';
import { prisma } from '@/core/persistence/client.js';
import { isOwner } from '@/core/permissions/index.js';

/**
 * Current version of the legal documents. Acceptance is one-time, but the
 * accepted version is recorded for traceability; bumping this does not, by
 * itself, force users to re-accept.
 */
export const LEGAL_VERSION = '1.0';

/**
 * Commands that must stay usable without having accepted the legal documents:
 * the legal viewer itself, the purely informational commands, and the GDPR
 * rights commands (a user must always be able to access or erase their data).
 */
export const LEGAL_GATE_EXEMPT_COMMANDS: ReadonlySet<string> = new Set([
  'legal',
  'data',
  'delete-data',
  'help',
  'about',
]);

/**
 * In-memory set of user ids known to have accepted, so the gate - which runs on
 * every command - avoids a database round-trip for returning users. Only
 * positive results are cached; {@link prisma.legalAcceptance} stays the source
 * of truth across restarts.
 */
const acceptedUserIds = new Set<string>();

/** Returns whether `userId` has accepted the legal documents. */
export async function hasAcceptedLegal(userId: string): Promise<boolean> {
  if (acceptedUserIds.has(userId)) {
    return true;
  }
  const acceptance = await prisma.legalAcceptance.findUnique({
    where: { userId },
  });
  if (acceptance) {
    acceptedUserIds.add(userId);
    return true;
  }
  return false;
}

/** Whether `userId` still needs to accept the legal documents (the owner is exempt). */
export async function mustAcceptLegal(userId: string): Promise<boolean> {
  return !isOwner(userId) && !(await hasAcceptedLegal(userId));
}

/** Records `userId`'s acceptance of the current {@link LEGAL_VERSION}; idempotent. */
export async function acceptLegal(userId: string): Promise<void> {
  await prisma.legalAcceptance.upsert({
    where: { userId },
    create: { userId, acceptedVersion: LEGAL_VERSION },
    update: { acceptedVersion: LEGAL_VERSION },
  });
  acceptedUserIds.add(userId);
}

/** Returns `userId`'s acceptance record, or `null` if they never accepted. */
export function getAcceptance(userId: string): Promise<LegalAcceptance | null> {
  return prisma.legalAcceptance.findUnique({ where: { userId } });
}

/**
 * Drops `userId` from the acceptance cache. Called after erasure so the gate
 * re-locks the bot for them until they accept again.
 */
export function invalidateAcceptanceCache(userId: string): void {
  acceptedUserIds.delete(userId);
}
