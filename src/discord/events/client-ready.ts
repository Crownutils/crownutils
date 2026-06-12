import { Events } from 'discord.js';
import type { Event } from '@/discord/types/event.js';
import { logger } from '@/lib/logger.js';
import { rehydrateReminders } from '@/discord/reminders/reminder-bridge.js';

export const event = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.info(`Logged in as ${client.user.tag}`);
    await rehydrateReminders(client);
  },
} satisfies Event<Events.ClientReady>;
