import { prisma } from '../persistence/client.js';
import { TtlCache } from '../cache/ttl-cache.js';

/**
 * Current version of the legal documents. Acceptance is one-time, but the
 * accepted version is recorded for traceability; bumping this does not, by
 * itself, force users to re-accept.
 */
export const LEGAL_VERSION = '1.1';

/**
 * Commands that must stay usable without having accepted the legal documents:
 * the registration flow itself and the GDPR access command (a user must always
 * be able to see their data).
 */
export const LEGAL_GATE_EXEMPT_COMMANDS: ReadonlySet<string> = new Set([
  'data',
  'delete-data',
  'register',
]);

/** Bounds the acceptance cache; comfortably holds every recently active user. */
const LEGAL_CACHE_MAX_SIZE = 10_000;
/** Short TTL so an out-of-band database edit applies within 5 minutes. */
const LEGAL_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Caches acceptance per user, both outcomes: the legal gate runs on every
 * command. The database stays the source of truth.
 */
const legalCache = new TtlCache<string, boolean>(
  LEGAL_CACHE_MAX_SIZE,
  LEGAL_CACHE_TTL_MS,
);

/** A user's recorded acceptance: which legal version they accepted, and when. */
export interface LegalAcceptanceRecord {
  readonly acceptedVersion: string;
  readonly acceptedAt: Date;
}

async function loadHasAcceptedLegal(userId: string): Promise<boolean> {
  const acceptance = await prisma.legalAcceptance.findUnique({
    where: { userId },
    select: { userId: true },
  });
  return acceptance !== null;
}

/** Returns whether `userId` has accepted the legal documents. */
export async function hasAcceptedLegal(userId: string): Promise<boolean> {
  return legalCache.getOrLoad(userId, loadHasAcceptedLegal);
}

/** Returns `userId`'s acceptance record, or `null` if they have not accepted. */
export async function getLegalAcceptance(
  userId: string,
): Promise<LegalAcceptanceRecord | null> {
  const acceptance = await prisma.legalAcceptance.findUnique({
    where: { userId },
    select: { acceptedVersion: true, acceptedAt: true },
  });
  legalCache.set(userId, acceptance !== null);
  return acceptance;
}

/** Records `userId`'s acceptance of the current {@link LEGAL_VERSION}; idempotent. */
export async function acceptLegal(userId: string): Promise<void> {
  await prisma.legalAcceptance.upsert({
    where: { userId },
    create: { userId, acceptedVersion: LEGAL_VERSION },
    update: { acceptedVersion: LEGAL_VERSION },
  });
  legalCache.set(userId, true);
}

/** Deletes `userId`'s legal acceptance and evicts the cache; returns whether a record existed. */
export async function deleteLegalAcceptance(userId: string): Promise<boolean> {
  const { count } = await prisma.legalAcceptance.deleteMany({
    where: { userId },
  });
  legalCache.delete(userId);
  return count > 0;
}
