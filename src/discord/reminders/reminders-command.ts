import type { Reminder } from '@/core/persistence/prisma/client.js';
import type { Container } from '@/discord/components/index.js';
import { buildReminderListContainer } from '@/discord/presentations/reminder-presentation.js';
import { listReminders } from '@/discord/reminders/reminder-bridge.js';

/** Result of {@link runRemindersCommand}: the list container and the reminders it shows. */
export interface RemindersCommandResult {
  container: Container;
  reminders: Reminder[];
}

/** Shared `/reminders` logic: lists `userId`'s reminders and builds the container. */
export async function runRemindersCommand(
  userId: string,
): Promise<RemindersCommandResult> {
  const reminders = await listReminders(userId);
  return { container: buildReminderListContainer(reminders), reminders };
}
