import { prisma } from '../persistence/client.js';

/**
 * Current version of the legal documents. Acceptance is one-time, but the
 * accepted version is recorded for traceability; bumping this does not, by
 * itself, force users to re-accept.
 */
export const LEGAL_VERSION = '1.0';

/**
 * Commands that must stay usable without having accepted the legal documents:
 * the registration flow itself and the GDPR access command (a user must always
 * be able to see their data).
 */
export const LEGAL_GATE_EXEMPT_COMMANDS: ReadonlySet<string> = new Set([
  'data',
  'register',
]);

/**
 * In-memory set of user ids known to have accepted, so the gate - which runs on
 * every command - avoids a database round-trip for returning users. Only
 * positive results are cached; {@link prisma.legalAcceptance} stays the source
 * of truth across restarts.
 */
const acceptedUserIds = new Set<string>();

/** A user's recorded acceptance: which legal version they accepted, and when. */
export interface LegalAcceptanceRecord {
  readonly acceptedVersion: string;
  readonly acceptedAt: Date;
}

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

/** Returns `userId`'s acceptance record, or `null` if they have not accepted. */
export async function getLegalAcceptance(
  userId: string,
): Promise<LegalAcceptanceRecord | null> {
  const acceptance = await prisma.legalAcceptance.findUnique({
    where: { userId },
    select: { acceptedVersion: true, acceptedAt: true },
  });
  if (acceptance) acceptedUserIds.add(userId);
  return acceptance;
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
