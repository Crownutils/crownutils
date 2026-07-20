import { Events } from 'discord.js';
import type { EventModule } from '../registries/index.js';
import { logger } from '@/shared/index.js';
import { createReminderDeliverer } from '../features/reminder/reminder.delivery.js';
import { reminderScheduler } from '../features/reminder/reminder.scheduler.js';

const event = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.info(`Logged in as ${client.user.tag}`);
    await reminderScheduler.start(createReminderDeliverer(client));
  },
} satisfies EventModule<Events.ClientReady>;

export default event;
