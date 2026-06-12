import { env } from '@/core/config/index.js';
import { MAX_TIMEOUT_MS, parseDurationMs } from '@/core/time/index.js';
import { countReminders } from './reminder-repository.js';

export const DEFAULT_REMINDER_DURATION = '9m45s';
export const MAX_REMINDER_PER_PRIVILEGED_USER = 5;
export const MAX_REMINDERS_PER_USER = 1;

export type ReminderInputError =
  | 'invalid_format'
  | 'duration_too_long'
  | 'limit_reached';

export type ValidateReminderInputResult =
  | { ok: true; triggerAt: Date }
  | { ok: false; error: ReminderInputError };

export async function validateReminderInput(
  userId: string,
  durationInput: string,
  message: string,
): Promise<ValidateReminderInputResult> {
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
    const reminderCount = await countReminders(userId);
    if (reminderCount >= maxReminders) {
      return { ok: false, error: 'limit_reached' };
    }
  }

  return { ok: true, triggerAt: new Date(Date.now() + durationMs) };
}
