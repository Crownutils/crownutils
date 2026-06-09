import { TimestampStyles, time } from 'discord.js';
import type { Reminder } from '@/generated/prisma/client.js';
import { lang } from '@/lang/index.js';
import { Container, Text, Title } from '@/lib/components/index.js';

export function buildReminderCreatedContainer(reminder: Reminder): Container {
  return new Container().color('success').add(
    new Title(lang.reminder.messages.created.title),
    new Text(
      lang.reminder.messages.created.description({
        message: reminder.message,
        when: time(reminder.triggerAt, TimestampStyles.RelativeTime),
      }),
    ),
  );
}

export function buildReminderTriggeredContainer(reminder: Reminder): Container {
  return new Container()
    .color('info')
    .add(
      new Title(lang.reminder.messages.triggeredTitle),
      new Text(reminder.message),
      new Text(`<@${reminder.userId}>`),
    );
}
