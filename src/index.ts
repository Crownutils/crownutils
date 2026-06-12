import { CrownutilsClient } from '@/discord/client/crownutils-client.js';
import { requireEnv } from '@/core/config/index.js';
import { logger } from '@/shared/logger.js';
import { prisma } from '@/core/persistence/client.js';

const token = requireEnv('discordToken');

const client = new CrownutilsClient();
await client.init();
await client.login(token);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    logger.info(`Received ${signal}, shutting down.`);
    void prisma.$disconnect().finally(() => process.exit(0));
  });
}
