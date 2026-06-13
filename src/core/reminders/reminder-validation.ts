import { env } from '@/core/config/index.js';
import { MAX_TIMEOUT_MS, parseDurationMs } from '@/core/time/index.js';
import { countReminders } from './reminder-repository.js';

/** Duration used when a reminder is created without an explicit duration. */
export const DEFAULT_REMINDER_DURATION = '9m45s';
/** Maximum number of simultaneous reminders for users in `env.privilegedIds`. */
export const MAX_REMINDER_PER_PRIVILEGED_USER = 5;
/** Maximum number of simultaneous reminders for non-privileged users. */
export const MAX_REMINDERS_PER_USER = 3;

/** Reason `validateReminderInput` rejected a reminder request. */
export type ReminderInputError =
  | 'invalid_format'
  | 'duration_too_long'
  | 'limit_reached';

export type ValidateReminderInputResult =
  | { ok: true; triggerAt: Date }
  | { ok: false; error: ReminderInputError };

/**
 * Returns the reminder limit for a given user based on their privilege tier.
 *
 * Note: the bot owner bypasses this limit entirely in
 * {@link validateReminderInput} — this function still returns the
 * privileged tier's value for them.
 */
export function getMaxRemindersForUser(userId: string): number {
  return env.privilegedIds.includes(userId)
    ? MAX_REMINDER_PER_PRIVILEGED_USER
    : MAX_REMINDERS_PER_USER;
}

/**
 * Validates a reminder request: duration format, maximum allowed duration,
 * and per-user reminder limit (skipped entirely for the bot owner).
 */
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
    const maxReminders = getMaxRemindersForUser(userId);
    const reminderCount = await countReminders(userId);
    if (reminderCount >= maxReminders) {
      return { ok: false, error: 'limit_reached' };
    }
  }

  return { ok: true, triggerAt: new Date(Date.now() + durationMs) };
}
