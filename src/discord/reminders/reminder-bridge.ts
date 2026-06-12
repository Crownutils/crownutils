import type { Client } from 'discord.js';
import type { Reminder } from '@/core/persistence/prisma/client.js';
import {
  createReminder,
  deleteReminder,
  findReminder,
  listAllReminders,
} from '@/core/reminders/reminder-repository.js';
import {
  scheduleReminder,
  unscheduleReminder,
} from '@/core/reminders/reminder-scheduler.js';
import {
  validateReminderInput,
  type ReminderInputError,
} from '@/core/reminders/reminder-validation.js';
import { logger } from '@/lib/logger.js';
import { buildReminderTriggeredContainer } from '@/services/presentations/reminder-presentation.js';

export { listReminders } from '@/core/reminders/reminder-repository.js';
export {
  DEFAULT_REMINDER_DURATION,
  MAX_REMINDER_PER_PRIVILEGED_USER,
  MAX_REMINDERS_PER_USER,
} from '@/core/reminders/reminder-validation.js';

export type CreateReminderResult =
  | { ok: true; reminder: Reminder }
  | { ok: false; error: ReminderInputError };

export async function createReminderFromInput(
  client: Client,
  channelId: string,
  userId: string,
  durationInput: string,
  message: string,
): Promise<CreateReminderResult> {
  const validation = await validateReminderInput(
    userId,
    durationInput,
    message,
  );
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  const reminder = await createReminder(
    channelId,
    userId,
    validation.triggerAt,
    message,
  );
  scheduleReminder(reminder, (r) => void sendReminder(client, r));

  return { ok: true, reminder };
}

export function cancelReminder(id: string): Promise<boolean> {
  unscheduleReminder(id);
  return deleteReminder(id);
}

export async function deleteUserReminder(
  id: string,
  userId: string,
): Promise<boolean> {
  const reminder = await findReminder(id);
  if (!reminder || reminder.userId !== userId) {
    return false;
  }
  return cancelReminder(id);
}

async function sendReminder(client: Client, reminder: Reminder): Promise<void> {
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
    await deleteReminder(reminder.id);
  } catch (error) {
    logger.error(
      { error, reminderId: reminder.id },
      'Failed to delete reminder after trigger.',
    );
  }
}

export async function rehydrateReminders(client: Client): Promise<void> {
  let reminders: Reminder[];
  try {
    reminders = await listAllReminders();
  } catch (error) {
    logger.error({ error }, 'Failed to load reminders for rehydration.');
    return;
  }

  for (const reminder of reminders) {
    scheduleReminder(reminder, (r) => void sendReminder(client, r));
  }

  logger.info(`Rehydrated ${reminders.length} reminder(s).`);
}
