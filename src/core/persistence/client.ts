import { PrismaClient } from '@/generated/prisma/client.js';
import { config } from '../config/index.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: config.databaseUrl });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Shared Prisma client backed by better-sqlite3. Cached on `globalThis`
 * outside production so hot reloads reuse the same connection.
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!config.isProduction) {
  globalForPrisma.prisma = prisma;
}
