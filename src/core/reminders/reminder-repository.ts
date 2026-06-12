import type { Reminder } from '@/core/persistence/prisma/client.js';
import { prisma } from '@/core/persistence/client.js';

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

export function listReminders(userId: string): Promise<Reminder[]> {
  return prisma.reminder.findMany({
    where: { userId },
    orderBy: { triggerAt: 'asc' },
  });
}

export function listAllReminders(): Promise<Reminder[]> {
  return prisma.reminder.findMany();
}

export function findReminder(id: string): Promise<Reminder | null> {
  return prisma.reminder.findUnique({ where: { id } });
}

export async function deleteReminder(id: string): Promise<boolean> {
  try {
    await prisma.reminder.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export function countReminders(userId: string): Promise<number> {
  return prisma.reminder.count({ where: { userId } });
}
