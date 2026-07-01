import type {
  DataAccessUsage,
  LegalAcceptance,
  MailNotice,
  PathfinderUsage,
  Reminder,
} from '@/core/persistence/prisma/client.js';
import { isOwner } from '@/core/permissions/index.js';
import { prisma } from '@/core/persistence/client.js';
import { listReminders } from '@/core/reminders/reminder-repository.js';
import { unscheduleReminder } from '@/core/reminders/reminder-scheduler.js';
import { invalidateAcceptanceCache } from './legal-repository.js';

/** Minimum delay between two data-access (export) requests: 31 days. */
export const DATA_ACCESS_COOLDOWN_MS = 31 * 24 * 60 * 60 * 1000;

/** Outcome of a data-access request: allowed, or throttled until a future date. */
export type DataAccessResult =
  | { allowed: true }
  | { allowed: false; nextEligibleAt: Date };

/**
 * Records a data-access request for `userId` and reports whether it is allowed.
 * Each user may export their data once every {@link DATA_ACCESS_COOLDOWN_MS};
 * the bot owner is exempt and never recorded.
 */
export async function consumeDataAccess(
  userId: string,
): Promise<DataAccessResult> {
  if (isOwner(userId)) {
    return { allowed: true };
  }

  const now = new Date();
  const previous = await prisma.dataAccessUsage.findUnique({
    where: { userId },
  });
  if (previous) {
    const nextEligibleAt = new Date(
      previous.lastRequestedAt.getTime() + DATA_ACCESS_COOLDOWN_MS,
    );
    if (nextEligibleAt > now) {
      return { allowed: false, nextEligibleAt };
    }
  }

  await prisma.dataAccessUsage.upsert({
    where: { userId },
    create: { userId, lastRequestedAt: now },
    update: { lastRequestedAt: now },
  });
  return { allowed: true };
}

/** Every piece of data the bot stores about a single user. */
export interface UserDataSnapshot {
  reminders: Reminder[];
  pathfinderUsage: PathfinderUsage | null;
  readMailIds: string[];
  mailNotice: MailNotice | null;
  legalAcceptance: LegalAcceptance | null;
  dataAccessUsage: DataAccessUsage | null;
}

/** Gathers everything stored about `userId`, for the data-access export. */
export async function collectUserData(
  userId: string,
): Promise<UserDataSnapshot> {
  const [
    reminders,
    pathfinderUsage,
    mailReads,
    mailNotice,
    legalAcceptance,
    dataAccessUsage,
  ] = await Promise.all([
    listReminders(userId),
    prisma.pathfinderUsage.findUnique({ where: { userId } }),
    prisma.mailRead.findMany({ where: { userId }, select: { mailId: true } }),
    prisma.mailNotice.findUnique({ where: { userId } }),
    prisma.legalAcceptance.findUnique({ where: { userId } }),
    prisma.dataAccessUsage.findUnique({ where: { userId } }),
  ]);

  return {
    reminders,
    pathfinderUsage,
    readMailIds: mailReads.map((receipt) => receipt.mailId),
    mailNotice,
    legalAcceptance,
    dataAccessUsage,
  };
}

/** Counts of the rows removed by {@link deleteUserData}. */
export interface DeletionSummary {
  reminders: number;
  hadData: boolean;
}

/**
 * Erases every row tied to `userId` (right to erasure). Scheduled reminder
 * timers are cancelled first, then all rows are deleted - including the legal
 * acceptance, so the gate re-locks the bot until the user accepts again. The
 * acceptance cache is invalidated accordingly.
 */
export async function deleteUserData(userId: string): Promise<DeletionSummary> {
  const reminders = await listReminders(userId);
  for (const reminder of reminders) {
    unscheduleReminder(reminder.id);
  }

  const [
    deletedReminders,
    deletedPathfinder,
    deletedMailReads,
    deletedMailNotice,
    deletedAcceptance,
    deletedDataAccess,
  ] = await prisma.$transaction([
    prisma.reminder.deleteMany({ where: { userId } }),
    prisma.pathfinderUsage.deleteMany({ where: { userId } }),
    prisma.mailRead.deleteMany({ where: { userId } }),
    prisma.mailNotice.deleteMany({ where: { userId } }),
    prisma.legalAcceptance.deleteMany({ where: { userId } }),
    prisma.dataAccessUsage.deleteMany({ where: { userId } }),
  ]);

  invalidateAcceptanceCache(userId);

  const hadData =
    deletedReminders.count +
      deletedPathfinder.count +
      deletedMailReads.count +
      deletedMailNotice.count +
      deletedAcceptance.count +
      deletedDataAccess.count >
    0;

  return { reminders: deletedReminders.count, hadData };
}
