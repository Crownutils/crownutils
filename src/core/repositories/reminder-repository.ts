import { prisma } from '../persistence/client.js';
import {
  ACTIVE_REMINDER_STATUSES,
  type Rank,
  type ReminderStatus,
} from '../types.js';

/** Longest horizon a reminder may be scheduled for. */
export const MAX_REMINDER_DELAY_YEARS = 10;

/** Longest reminder text accepted. */
export const REMINDER_CONTENT_MAX_LENGTH = 1500;

/** Most reminders shown in a `reminders` list. */
export const REMINDER_LIST_LIMIT = 25;

/** Due reminders claimed per scheduler drain. */
export const DUE_BATCH_SIZE = 50;

/** Max simultaneous active reminders per rank; owner is unlimited. */
const REMINDER_LIMITS: Readonly<Record<Rank, number>> = {
  banned: 0,
  normal: 3,
  privileged: 5,
  owner: Number.POSITIVE_INFINITY,
};

/** Fields needed to create a reminder; the rest are schema defaults. */
export interface NewReminder {
  readonly userId: string;
  readonly channelId: string;
  readonly content: string;
  readonly dueAt: Date;
  /** Original delay in ms; stored so a relaunch reuses the exact same duration. */
  readonly durationMs: number;
}

/** A reminder as shown to its owner in `reminders`. */
export interface ActiveReminder {
  readonly id: string;
  readonly content: string;
  readonly dueAt: Date;
}

/** A reminder as included in a user's GDPR data export, whatever its status. */
export interface GdprReminder {
  readonly content: string;
  readonly dueAt: Date;
  readonly status: ReminderStatus;
  readonly createdAt: Date;
}

/** The fields the scheduler needs to deliver a reminder. */
export interface DueReminder {
  readonly id: string;
  readonly userId: string;
  readonly channelId: string;
  readonly content: string;
  readonly dueAt: Date;
  readonly durationMs: number;
  readonly attempts: number;
}

/** Max active reminders `rank` may hold at once. */
export function reminderLimitForRank(rank: Rank): number {
  return REMINDER_LIMITS[rank];
}

/** Counts `userId`'s active reminders, for the quota check. */
export async function countActiveReminders(userId: string): Promise<number> {
  return prisma.reminder.count({
    where: { userId, status: { in: [...ACTIVE_REMINDER_STATUSES] } },
  });
}

/** Persists a new pending reminder. */
export async function createReminder(
  reminder: NewReminder,
): Promise<ActiveReminder> {
  return prisma.reminder.create({
    data: reminder,
    select: { id: true, content: true, dueAt: true },
  });
}

/** `userId`'s active reminders, soonest first, capped at {@link REMINDER_LIST_LIMIT}. */
export async function listActiveReminders(
  userId: string,
): Promise<ActiveReminder[]> {
  return prisma.reminder.findMany({
    where: { userId, status: { in: [...ACTIVE_REMINDER_STATUSES] } },
    orderBy: { dueAt: 'asc' },
    take: REMINDER_LIST_LIMIT,
    select: { id: true, content: true, dueAt: true },
  });
}

/** Every reminder stored for `userId`, any status, newest first - for the GDPR export. */
export async function listRemindersForGdpr(
  userId: string,
): Promise<GdprReminder[]> {
  return prisma.reminder.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { content: true, dueAt: true, status: true, createdAt: true },
  });
}

/** Deletes `userId`'s still-pending reminder `id`; `false` if already firing or gone. */
export async function deleteUserReminder(
  id: string,
  userId: string,
): Promise<boolean> {
  const { count } = await prisma.reminder.deleteMany({
    where: { id, userId, status: 'pending' },
  });
  return count === 1;
}

/** Deletes every reminder stored for `userId`, any status (GDPR erasure); returns the count. */
export async function deleteAllUserReminders(userId: string): Promise<number> {
  const { count } = await prisma.reminder.deleteMany({ where: { userId } });
  return count;
}

/** Earliest pending due date the timer arms on, or `null`. */
export async function getNextReminderDueAt(): Promise<Date | null> {
  const next = await prisma.reminder.findFirst({
    where: { status: 'pending' },
    orderBy: { dueAt: 'asc' },
    select: { dueAt: true },
  });
  return next?.dueAt ?? null;
}

/** Up to `limit` pending reminders due by `now`, oldest first. */
export async function getDueReminders(
  now: Date,
  limit: number,
): Promise<DueReminder[]> {
  return prisma.reminder.findMany({
    where: { status: 'pending', dueAt: { lte: now } },
    orderBy: { dueAt: 'asc' },
    take: limit,
    select: {
      id: true,
      userId: true,
      channelId: true,
      content: true,
      dueAt: true,
      durationMs: true,
      attempts: true,
    },
  });
}

/**
 * Atomically claims `id` (`pending -> delivering`, bumps `attempts`). The guarded
 * `updateMany` is race-free on single-process SQLite, so a reminder fires once.
 */
export async function claimReminder(id: string): Promise<boolean> {
  const { count } = await prisma.reminder.updateMany({
    where: { id, status: 'pending' },
    data: { status: 'delivering', attempts: { increment: 1 } },
  });
  return count === 1;
}

/** Settles a claimed reminder as delivered. */
export async function markReminderDelivered(
  id: string,
  now: Date = new Date(),
): Promise<void> {
  await prisma.reminder.updateMany({
    where: { id, status: 'delivering' },
    data: { status: 'delivered', deliveredAt: now },
  });
}

/** Settles a claimed reminder as permanently failed, recording the reason. */
export async function markReminderFailed(
  id: string,
  error: string,
): Promise<void> {
  await prisma.reminder.updateMany({
    where: { id, status: 'delivering' },
    data: { status: 'failed', lastError: error },
  });
}

/** Returns a claimed reminder to pending at a later `dueAt` after a transient failure. */
export async function requeueReminder(
  id: string,
  dueAt: Date,
  error: string,
): Promise<void> {
  await prisma.reminder.updateMany({
    where: { id, status: 'delivering' },
    data: { status: 'pending', dueAt, lastError: error },
  });
}

/** Reclaims orphaned `delivering` rows back to `pending` on startup. Returns the count. */
export async function reclaimStuckReminders(): Promise<number> {
  const { count } = await prisma.reminder.updateMany({
    where: { status: 'delivering' },
    data: { status: 'pending' },
  });
  return count;
}
