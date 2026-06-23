import type { Reminder } from '@/core/persistence/prisma/client.js';
import { CustomId } from '@/discord/custom-id.js';
import { relativeTimestamp } from '@/discord/timestamps.js';
import { icons } from '@/discord/icons.js';
import { lang } from '@/discord/lang/index.js';
import {
  ActionRow,
  Button,
  Container,
  Section,
  Text,
  Title,
} from '@/discord/components/index.js';

const REMINDER_DELETE_CONTEXT = 'reminder-delete';
const REMINDER_CANCEL_CONTEXT = 'reminder-cancel';

function reminderDeleteButtonId(reminderId: string): string {
  return new CustomId(REMINDER_DELETE_CONTEXT, reminderId).value;
}

/** Extracts the reminder id from a delete button's custom id, or `null` if it doesn't match. */
export function parseReminderDeleteButtonId(customId: string): string | null {
  const parsed = CustomId.parse(customId);
  if (!parsed || parsed.ctx !== REMINDER_DELETE_CONTEXT) {
    return null;
  }
  return parsed.id;
}

function reminderCancelButtonId(reminderId: string): string {
  return new CustomId(REMINDER_CANCEL_CONTEXT, reminderId).value;
}

/** Extracts the reminder id from a cancel button's custom id, or `null` if it doesn't match. */
export function parseReminderCancelButtonId(customId: string): string | null {
  const parsed = CustomId.parse(customId);
  if (!parsed || parsed.ctx !== REMINDER_CANCEL_CONTEXT) {
    return null;
  }
  return parsed.id;
}

/**
 * Builds the reminder confirmation container, with a cancel button. Pass
 * `disabled: true` once the cancel window has expired.
 */
export function buildReminderCreatedContainer(
  reminder: Reminder,
  options?: { disabled?: boolean },
): Container {
  const cancelButton = new Button(reminderCancelButtonId(reminder.id))
    .color('danger')
    .label(lang.commands.remind.messages.created.cancelButton);
  if (options?.disabled) {
    cancelButton.disabled();
  }

  return new Container().color('success').add(
    new Title(lang.commands.remind.messages.created.title),
    new Text(
      lang.commands.remind.messages.created.description({
        message: reminder.message,
        when: relativeTimestamp(reminder.triggerAt),
      }),
    ),
    new ActionRow(cancelButton),
  );
}

/** Builds the container shown after a reminder is cancelled. */
export function buildReminderCancelledContainer(reminder: Reminder): Container {
  return new Container().color('cancelled').add(
    new Title(lang.commands.remind.messages.cancelled.title),
    new Text(
      lang.commands.remind.messages.cancelled.description({
        message: reminder.message,
      }),
    ),
  );
}

/** Builds the container sent when a reminder fires, mentioning its owner. */
export function buildReminderTriggeredContainer(reminder: Reminder): Container {
  return new Container()
    .color('info')
    .add(
      new Title(lang.commands.remind.messages.triggered.title),
      new Text(reminder.message),
      new Text(`<@${reminder.userId}>`),
    );
}

/**
 * Builds the `/reminders` list container, with a delete button per reminder.
 * Shows an empty-state message if `reminders` is empty.
 */
export function buildReminderListContainer(
  reminders: Reminder[],
  options?: { disabled?: boolean },
): Container {
  if (reminders.length === 0) {
    return new Container()
      .color('info')
      .add(new Text(lang.commands.reminders.messages.empty));
  }

  const container = new Container()
    .color('info')
    .add(new Title(lang.commands.reminders.messages.title));

  for (const reminder of reminders) {
    const deleteButton = new Button(reminderDeleteButtonId(reminder.id))
      .color('danger')
      .emoji(icons.trash);
    if (options?.disabled) {
      deleteButton.disabled();
    }

    container.add(
      new Section()
        .add(
          new Text(
            lang.commands.reminders.messages.item({
              message: reminder.message,
              when: relativeTimestamp(reminder.triggerAt),
            }),
          ),
        )
        .button(deleteButton),
    );
  }

  return container;
}
