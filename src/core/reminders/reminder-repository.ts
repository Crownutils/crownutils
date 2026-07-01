import type { Reminder } from '@/core/persistence/prisma/client.js';
import { prisma } from '@/core/persistence/client.js';
import { logger } from '@/shared/logger.js';

/** True for Prisma's "record to delete does not exist" error (code `P2025`). */
function isRecordNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2025'
  );
}

/** Persists a new reminder. */
export function createReminder(
  channelId: string,
  userId: string,
  triggerAt: Date,
  message: string,
): Promise<Reminder> {
  return prisma.reminder.create({
    data: { channelId, userId, triggerAt, message },
  });
}

/** Lists `userId`'s reminders, soonest first. */
export function listReminders(userId: string): Promise<Reminder[]> {
  return prisma.reminder.findMany({
    where: { userId },
    orderBy: { triggerAt: 'asc' },
  });
}

/** Lists every reminder across all users. */
export function listAllReminders(): Promise<Reminder[]> {
  return prisma.reminder.findMany();
}

/** Finds a reminder by id, or `null` if it doesn't exist. */
export function findReminder(id: string): Promise<Reminder | null> {
  return prisma.reminder.findUnique({ where: { id } });
}

/**
 * Deletes a reminder by id. Returns `false` if it didn't exist; logs (and still
 * returns `false` for) any other failure rather than swallowing it silently.
 */
export async function deleteReminder(id: string): Promise<boolean> {
  try {
    await prisma.reminder.delete({ where: { id } });
    return true;
  } catch (error) {
    if (!isRecordNotFound(error)) {
      logger.error({ error, reminderId: id }, 'Failed to delete reminder.');
    }
    return false;
  }
}

/** Counts how many reminders `userId` currently has. */
export function countReminders(userId: string): Promise<number> {
  return prisma.reminder.count({ where: { userId } });
}
