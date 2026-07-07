import { prisma } from '../persistence/client.js';
import { hashUserId } from '../security/hash-user-id.js';
import { setUserRank } from './user-repository.js';

export async function persitBan(userId: string) {
  await setUserRank(userId, 'banned');
  const hash = hashUserId(userId);

  await prisma.banned.create({ data: { hash } });
}

/** Whether `userId` has a ban hash on record, regardless of their current rank. */
export async function hasBanHash(userId: string): Promise<boolean> {
  const hash = hashUserId(userId);
  const banned = await prisma.banned.findUnique({ where: { hash } });
  return banned !== null;
}

export async function canUserRegister(userId: string): Promise<boolean> {
  return !(await hasBanHash(userId));
}
