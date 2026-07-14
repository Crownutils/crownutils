import { config } from '@/core/config/index.js';
import { CrownutilsClient } from '@/discord/client/index.js';
import { reminderScheduler } from '@/discord/features/reminder/reminder.scheduler.js';
import { logger } from './shared/index.js';
import { prisma } from './core/persistence/client.js';

const client = new CrownutilsClient();
await client.init();
await client.login(config.discordToken);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    logger.info(`Received ${signal}, shutting down.`);
    void (async () => {
      await reminderScheduler.stop();
      await prisma.$disconnect();
      process.exit(0);
    })();
  });
}
