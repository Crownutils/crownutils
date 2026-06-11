import { TimestampStyles, time } from 'discord.js';
import type { Reminder } from '@/generated/prisma/client.js';
import { icons } from '@/lib/icons.js';
import { lang } from '@/lang/index.js';
import {
  ActionRow,
  Button,
  Container,
  Section,
  Text,
  Title,
} from '@/lib/components/index.js';

const REMINDER_DELETE_PREFIX = 'reminder-delete:';
const REMINDER_CANCEL_PREFIX = 'reminder-cancel:';

export function reminderDeleteButtonId(
  authorId: string,
  reminderId: string,
): string {
  return `${REMINDER_DELETE_PREFIX}${authorId}:${reminderId}`;
}

export function parseReminderDeleteButtonId(
  customId: string,
): { authorId: string; reminderId: string } | null {
  if (!customId.startsWith(REMINDER_DELETE_PREFIX)) {
    return null;
  }
  const [authorId, reminderId] = customId
    .slice(REMINDER_DELETE_PREFIX.length)
    .split(':');
  if (!authorId || !reminderId) {
    return null;
  }
  return { authorId, reminderId };
}

export function reminderCancelButtonId(reminderId: string): string {
  return `${REMINDER_CANCEL_PREFIX}${reminderId}`;
}

export function parseReminderCancelButtonId(customId: string): string | null {
  if (!customId.startsWith(REMINDER_CANCEL_PREFIX)) {
    return null;
  }
  return customId.slice(REMINDER_CANCEL_PREFIX.length) || null;
}

export function buildReminderCreatedContainer(
  reminder: Reminder,
  options?: { disabled?: boolean },
): Container {
  const cancelButton = new Button(reminderCancelButtonId(reminder.id))
    .color('danger')
    .label(lang.commands.reminder.messages.created.cancelButton);
  if (options?.disabled) {
    cancelButton.disabled();
  }

  return new Container().color('success').add(
    new Title(lang.commands.reminder.messages.created.title),
    new Text(
      lang.commands.reminder.messages.created.description({
        message: reminder.message,
        when: time(reminder.triggerAt, TimestampStyles.RelativeTime),
      }),
    ),
    new ActionRow(cancelButton),
  );
}

export function buildReminderCancelledContainer(reminder: Reminder): Container {
  return new Container().color('cancelled').add(
    new Title(lang.commands.reminder.messages.cancelled.title),
    new Text(
      lang.commands.reminder.messages.cancelled.description({
        message: reminder.message,
      }),
    ),
  );
}

export function buildReminderTriggeredContainer(reminder: Reminder): Container {
  return new Container()
    .color('info')
    .add(
      new Title(lang.commands.reminder.messages.triggeredTitle),
      new Text(reminder.message),
      new Text(`<@${reminder.userId}>`),
    );
}

export function buildReminderListContainer(
  reminders: Reminder[],
  options?: { disabled?: boolean },
): Container {
  if (reminders.length === 0) {
    return new Container()
      .color('info')
      .add(new Text(lang.commands.reminder.messages.list.empty));
  }

  const container = new Container()
    .color('info')
    .add(new Title(lang.commands.reminder.messages.list.title));

  for (const reminder of reminders) {
    const deleteButton = new Button(
      reminderDeleteButtonId(reminder.userId, reminder.id),
    )
      .color('danger')
      .emoji(icons.trash);
    if (options?.disabled) {
      deleteButton.disabled();
    }

    container.add(
      new Section()
        .add(
          new Text(
            lang.commands.reminder.messages.list.item({
              message: reminder.message,
              when: time(reminder.triggerAt, TimestampStyles.RelativeTime),
            }),
          ),
        )
        .button(deleteButton),
    );
  }

  return container;
}
