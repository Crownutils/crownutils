import { Events } from 'discord.js';
import type { Event } from '@/discord/types/event.js';
import { logger } from '@/shared/logger.js';
import { rehydrateReminders } from '@/discord/reminders/reminder-bridge.js';

/** Logs the bot's login and rehydrates persisted reminders on startup. */
export const event = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.info(`Logged in as ${client.user.tag}`);
    await rehydrateReminders(client);
  },
} satisfies Event<Events.ClientReady>;
