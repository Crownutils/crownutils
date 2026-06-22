import { env } from '@/core/config/index.js';
import { prisma } from '@/core/persistence/client.js';

/** True if `a` and `b` fall on the same calendar day in UTC. */
function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/**
 * Records a pathfinder route computation for `userId` and reports whether it
 * was allowed. Each user may compute one route per UTC calendar day; the bot
 * owner is exempt and never recorded. Returns `false` without recording when
 * the daily limit has already been reached.
 */
export async function consumePathfinderUse(userId: string): Promise<boolean> {
  if (userId === env.ownerId) {
    return true;
  }

  const now = new Date();
  const previous = await prisma.pathfinderUsage.findUnique({
    where: { userId },
  });
  if (previous && isSameUtcDay(previous.lastUsedAt, now)) {
    return false;
  }

  await prisma.pathfinderUsage.upsert({
    where: { userId },
    create: { userId, lastUsedAt: now },
    update: { lastUsedAt: now },
  });
  return true;
}
