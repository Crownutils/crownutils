import type { Reminder } from '@/core/persistence/prisma/client.js';
import { prisma } from '@/core/persistence/client.js';

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

/** Deletes a reminder by id. Returns `false` if it didn't exist. */
export async function deleteReminder(id: string): Promise<boolean> {
  try {
    await prisma.reminder.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

/** Counts how many reminders `userId` currently has. */
export function countReminders(userId: string): Promise<number> {
  return prisma.reminder.count({ where: { userId } });
}
