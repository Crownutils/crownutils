import { prisma } from '../persistence/client.js';
import { hashUserId } from '../security/hash-user-id.js';
import { setUserRank } from './user-repository.js';

/** Bans `userId`: sets their rank to `banned` and records the ban hash. Idempotent. */
export async function persistBan(userId: string): Promise<void> {
  await setUserRank(userId, 'banned');
  const hash = hashUserId(userId);
  await prisma.banned.upsert({ where: { hash }, create: { hash }, update: {} });
}

/** Whether `userId` has a ban hash on record, regardless of their current rank. */
export async function hasBanHash(userId: string): Promise<boolean> {
  const hash = hashUserId(userId);
  const banned = await prisma.banned.findUnique({ where: { hash } });
  return banned !== null;
}

/** Whether `userId` is allowed to register: everyone except users with a ban hash. */
export async function canUserRegister(userId: string): Promise<boolean> {
  return !(await hasBanHash(userId));
}
