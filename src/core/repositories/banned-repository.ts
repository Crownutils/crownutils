import { config } from '../config/index.js';
import { prisma } from '../persistence/client.js';
import { setUserRank } from './user-repository.js';
import { createHash } from 'node:crypto';

function createHashForUser(userId: string): string {
  return createHash('sha256')
    .update(userId + config.saltKey)
    .digest('hex');
}

export async function persitBan(userId: string) {
  await setUserRank(userId, 'banned');
  const hash = createHashForUser(userId);

  await prisma.banned.create({ data: { pseudoId: hash } });
}

export async function canUserRegister(userId: string): Promise<boolean> {
  const userHash = createHashForUser(userId);

  const banned = await prisma.banned.findUnique({
    where: { pseudoId: userHash },
  });

  return banned ? false : true;
}
