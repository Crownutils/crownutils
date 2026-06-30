import type { Client } from 'discord.js';
import type { Reminder } from '@/core/persistence/prisma/client.js';
import type { Container } from '@/discord/components/index.js';
import { buildErrorContainer } from '@/discord/errors.js';
import { lang } from '@/discord/lang/index.js';
import { buildReminderCreatedContainer } from '@/discord/presentations/reminder-presentation.js';
import {
  createReminderFromInput,
  getMaxRemindersForUser,
} from '@/discord/reminders/reminder-bridge.js';

/** Result of {@link runRemindCommand}: the container to show, plus the reminder when created. */
export interface RemindCommandResult {
  container: Container;
  /** Present only when the reminder was created successfully. */
  reminder?: Reminder;
}

/**
 * Shared `/remind` logic: creates the reminder from normalized inputs and
 * builds the resulting container, or an error container on failure.
 * `invalidFormatText` lets each entrypoint (prefix vs slash) pick its own
 * "format invalide" wording.
 */
export async function runRemindCommand(input: {
  client: Client;
  channelId: string;
  userId: string;
  durationInput: string;
  remindMessage: string;
  invalidFormatText: string;
}): Promise<RemindCommandResult> {
  const result = await createReminderFromInput(
    input.client,
    input.channelId,
    input.userId,
    input.durationInput,
    input.remindMessage,
  );

  if (!result.ok) {
    const errorText = {
      invalid_format: input.invalidFormatText,
      duration_too_long: lang.commands.remind.messages.durationTooLong,
      limit_reached: lang.commands.remind.messages.limitReached({
        max: getMaxRemindersForUser(input.userId),
      }),
    };
    return { container: buildErrorContainer(errorText[result.error]) };
  }

  return {
    container: buildReminderCreatedContainer(result.reminder),
    reminder: result.reminder,
  };
}
