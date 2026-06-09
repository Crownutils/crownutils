import { CrownutilsClient } from '@/client/crownutils-client.js';
import { requireEnv } from '@/lib/env.js';
import { logger } from '@/lib/logger.js';
import { prisma } from '@/lib/prisma.js';

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
