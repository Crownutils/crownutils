import { Events } from 'discord.js';
import type { Event } from '@/types/event.js';
import { logger } from '@/lib/logger.js';

export const event: Event<Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    logger.info(`Logged in as ${client.user.tag}`);
  },
};
