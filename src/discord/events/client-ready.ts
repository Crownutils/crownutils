import { Events } from 'discord.js';
import type { Event } from '@/discord/types/event.js';
import { logger } from '@/shared/logger.js';
import { rehydrateReminders } from '@/discord/reminders/reminder-bridge.js';
import { scheduleMailPurge } from '@/discord/mails/expiry-scheduler.js';

/**
 * Logs the bot's login, rehydrates persisted reminders, and starts the
 * recurring expired-mail purge on startup.
 */
export const event = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.info(`Logged in as ${client.user.tag}`);
    await rehydrateReminders(client);
    scheduleMailPurge();
  },
} satisfies Event<Events.ClientReady>;
