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
const REMINDER_CANCEL_BUTTON_ID = 'reminder-cancel';

function reminderDeleteButtonId(reminderId: string): string {
  return new CustomId(REMINDER_DELETE_CONTEXT, reminderId).value;
}

export function parseReminderDeleteButtonId(customId: string): string | null {
  const parsed = CustomId.parse(customId);
  if (!parsed || parsed.ctx !== REMINDER_DELETE_CONTEXT) {
    return null;
  }
  return parsed.id;
}

export function buildReminderCreatedContainer(
  reminder: Reminder,
  options?: { disabled?: boolean },
): Container {
  const cancelButton = new Button(REMINDER_CANCEL_BUTTON_ID)
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
        when: time(reminder.triggerAt, TimestampStyles.RelativeTime),
      }),
    ),
    new ActionRow(cancelButton),
  );
}

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

export function buildReminderTriggeredContainer(reminder: Reminder): Container {
  return new Container()
    .color('info')
    .add(
      new Title(lang.commands.remind.messages.triggered.title),
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
              when: time(reminder.triggerAt, TimestampStyles.RelativeTime),
            }),
          ),
        )
        .button(deleteButton),
    );
  }

  return container;
}
