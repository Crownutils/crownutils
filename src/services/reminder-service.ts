import type { Reminder } from '@/generated/prisma/client.js';
import { reminderMessages } from '@/lang/reminder.js';
import { Container } from '@/lib/components/container.js';
import { Text } from '@/lib/components/text.js';
import { Title } from '@/lib/components/title.js';
import { prisma } from '@/lib/prisma.js';
import type { Client } from 'discord.js';

export async function createReminder(
  channelId: string,
  userId: string,
  triggerAt: Date,
  message: string,
): Promise<Reminder> {
  const reminder = await prisma.reminder.create({
    data: {
      channelId,
      userId,
      triggerAt,
      message,
    },
  });

  return reminder;
}

async function triggerReminder(
  client: Client,
  reminder: Reminder,
): Promise<void> {
  const channel = await client.channels.fetch(reminder.channelId);

  if (channel?.isSendable()) {
    const payload = new Container()
      .color('info')
      .add(
        new Title(reminderMessages.triggered.title),
        new Text(reminder.message),
        new Text(`<@${reminder.userId}>`),
      )
      .build();

    await channel.send({
      ...payload,
      allowedMentions: { users: [reminder.userId] },
    });
  }

  await prisma.reminder.delete({
    where: { id: reminder.id },
  });
}

function scheduleReminder(client: Client, reminder: Reminder): void {
  const delay = Math.max(0, reminder.triggerAt.getTime() - Date.now());

  setTimeout(() => {
    void triggerReminder(client, reminder);
  }, delay);
}
