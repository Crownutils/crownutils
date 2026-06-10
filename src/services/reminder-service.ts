import type { Reminder } from '@/generated/prisma/client.js';
import { logger } from '@/lib/logger.js';
import { prisma } from '@/lib/prisma.js';
import { buildReminderTriggeredContainer } from '@/services/presentations/reminder-presentation.js';
import { MAX_TIMEOUT_MS, parseDurationMs } from '@/lib/time.js';
import { env } from '@/lib/env.js';
import type { Client } from 'discord.js';

export const DEFAULT_REMINDER_DURATION = '9m45s';
export const MAX_REMINDER_PER_PRIVILEGED_USER = 5;
export const MAX_REMINDERS_PER_USER = 1;

export type ReminderInputError =
  | 'invalid_format'
  | 'duration_too_long'
  | 'limit_reached';

export type CreateReminderResult =
  | { ok: true; reminder: Reminder }
  | { ok: false; error: ReminderInputError };

const timers = new Map<string, NodeJS.Timeout>();

async function createReminder(
  channelId: string,
  userId: string,
  triggerAt: Date,
  message: string,
): Promise<Reminder> {
  return prisma.reminder.create({
    data: { channelId, userId, triggerAt, message },
  });
}

export async function createReminderFromInput(
  client: Client,
  channelId: string,
  userId: string,
  durationInput: string,
  message: string,
): Promise<CreateReminderResult> {
  const durationMs = parseDurationMs(durationInput);
  if (durationMs === null || durationMs <= 0 || message.length === 0) {
    return { ok: false, error: 'invalid_format' };
  }
  if (durationMs > MAX_TIMEOUT_MS) {
    return { ok: false, error: 'duration_too_long' };
  }

  if (userId !== env.ownerId) {
    const isPrivilegedUser = env.privilegedIds.includes(userId);
    const maxReminders = isPrivilegedUser
      ? MAX_REMINDER_PER_PRIVILEGED_USER
      : MAX_REMINDERS_PER_USER;
    const reminderCount = await prisma.reminder.count({ where: { userId } });
    if (reminderCount >= maxReminders) {
      return { ok: false, error: 'limit_reached' };
    }
  }

  const triggerAt = new Date(Date.now() + durationMs);
  const reminder = await createReminder(channelId, userId, triggerAt, message);
  scheduleReminder(client, reminder);

  return { ok: true, reminder };
}

export function listReminders(userId: string): Promise<Reminder[]> {
  return prisma.reminder.findMany({
    where: { userId },
    orderBy: { triggerAt: 'asc' },
  });
}

export async function cancelReminder(id: string): Promise<boolean> {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }

  try {
    await prisma.reminder.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function deleteUserReminder(
  id: string,
  userId: string,
): Promise<boolean> {
  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder || reminder.userId !== userId) {
    return false;
  }
  return cancelReminder(id);
}

async function triggerReminder(
  client: Client,
  reminder: Reminder,
): Promise<void> {
  timers.delete(reminder.id);

  try {
    const channel = await client.channels.fetch(reminder.channelId);
    if (channel?.isSendable()) {
      const payload = buildReminderTriggeredContainer(reminder).build();
      await channel.send({
        ...payload,
        allowedMentions: { users: [reminder.userId] },
      });
    }
  } catch (error) {
    logger.error(
      { error, reminderId: reminder.id },
      'Failed to deliver reminder.',
    );
  }

  try {
    await prisma.reminder.delete({ where: { id: reminder.id } });
  } catch (error) {
    logger.error(
      { error, reminderId: reminder.id },
      'Failed to delete reminder after trigger.',
    );
  }
}

function scheduleReminder(client: Client, reminder: Reminder): void {
  const existing = timers.get(reminder.id);
  if (existing) {
    clearTimeout(existing);
  }

  const remaining = reminder.triggerAt.getTime() - Date.now();
  const delay = Math.min(Math.max(0, remaining), MAX_TIMEOUT_MS);

  const timer = setTimeout(() => {
    void triggerReminder(client, reminder);
  }, delay);

  timers.set(reminder.id, timer);
}

export async function rehydrateReminders(client: Client): Promise<void> {
  let reminders: Reminder[];
  try {
    reminders = await prisma.reminder.findMany();
  } catch (error) {
    logger.error({ error }, 'Failed to load reminders for rehydration.');
    return;
  }

  for (const reminder of reminders) {
    scheduleReminder(client, reminder);
  }

  logger.info(`Rehydrated ${reminders.length} reminder(s).`);
}
