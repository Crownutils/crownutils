import type { Reminder } from '@/core/persistence/prisma/client.js';
import { MAX_TIMEOUT_MS } from '@/core/time/index.js';

/** Callback invoked when a scheduled reminder fires. */
export type OnTrigger = (reminder: Reminder) => void;

const timers = new Map<string, NodeJS.Timeout>();

/**
 * Schedules `onTrigger` to run at `reminder.triggerAt`, replacing any
 * existing timer for the same reminder. Delay is capped at
 * {@link MAX_TIMEOUT_MS} - reminders further out must be re-scheduled
 * before then.
 */
export function scheduleReminder(
  reminder: Reminder,
  onTrigger: OnTrigger,
): void {
  unscheduleReminder(reminder.id);

  const remaining = reminder.triggerAt.getTime() - Date.now();
  const delay = Math.min(Math.max(0, remaining), MAX_TIMEOUT_MS);

  const timer = setTimeout(() => {
    timers.delete(reminder.id);
    onTrigger(reminder);
  }, delay);

  timers.set(reminder.id, timer);
}

/** Cancels a previously scheduled reminder, if any. */
export function unscheduleReminder(id: string): void {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
}
