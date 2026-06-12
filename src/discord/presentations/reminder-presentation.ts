import { TimestampStyles, time } from 'discord.js';
import type { Reminder } from '@/core/persistence/prisma/client.js';
import { CustomId } from '@/discord/custom-id.js';
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

export function reminderDeleteButtonId(reminderId: string): string {
  return new CustomId(REMINDER_DELETE_CONTEXT, reminderId).value;
}

export function parseReminderDeleteButtonId(customId: string): string | null {
  const parsed = CustomId.parse(customId);
  if (!parsed || parsed.ctx !== REMINDER_DELETE_CONTEXT) {
    return null;
  }
  return parsed.id;
}

export function reminderCancelButtonId(reminderId: string): string {
  return new CustomId(REMINDER_CANCEL_CONTEXT, reminderId).value;
}

export function parseReminderCancelButtonId(customId: string): string | null {
  const parsed = CustomId.parse(customId);
  if (!parsed || parsed.ctx !== REMINDER_CANCEL_CONTEXT) {
    return null;
  }
  return parsed.id;
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
