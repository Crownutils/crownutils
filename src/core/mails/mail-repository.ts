import type { Mail } from '@/core/persistence/prisma/client.js';
import { prisma } from '@/core/persistence/client.js';
import { isSameUtcDay } from '@/core/time/index.js';

/** Mails are auto-deleted two weeks after creation. */
export const MAIL_TTL_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Cache of non-expired mails, newest first. Invalidated (set to `undefined`)
 * on creation and purge, then reloaded lazily. Holds full rows so `/mails` can
 * render without a query.
 */
let activeMailsCache: Mail[] | undefined;

/**
 * Per-user UTC day already evaluated for the unread reminder, so repeated
 * commands the same day cost no query. Wiped on day rollover and whenever a
 * new mail is created. The persistent {@link prisma.mailNotice} row remains the
 * source of truth across restarts.
 */
const handledToday = new Map<string, string>();
let handledCacheDay: string | undefined;

/** UTC calendar-day key (`YYYY-M-D`), used to throttle the daily unread reminder. */
function utcDayKey(date: Date): string {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
}

/** Oldest `createdAt` a mail can keep without being expired. */
function expiryCutoff(now: Date): Date {
  return new Date(now.getTime() - MAIL_TTL_MS);
}

/** Loads (once) and returns the non-expired mails, newest first. */
async function ensureActiveMails(now: Date): Promise<Mail[]> {
  if (activeMailsCache === undefined) {
    activeMailsCache = await prisma.mail.findMany({
      where: { createdAt: { gte: expiryCutoff(now) } },
      orderBy: { createdAt: 'desc' },
    });
  }
  // Filter again in case rows expired since the cache was loaded (between purges).
  const cutoff = expiryCutoff(now);
  return activeMailsCache.filter((mail) => mail.createdAt >= cutoff);
}

/** Returns the non-expired mails, newest first, for the `/mails` inbox. */
export function listActiveMails(): Promise<Mail[]> {
  return ensureActiveMails(new Date());
}

/** Returns the set of mail ids `userId` has already opened. */
export async function getReadMailIds(userId: string): Promise<Set<string>> {
  const receipts = await prisma.mailRead.findMany({
    where: { userId },
    select: { mailId: true },
  });
  return new Set(receipts.map((receipt) => receipt.mailId));
}

/** Records that `userId` opened `mailId`; idempotent. */
export async function markMailRead(
  userId: string,
  mailId: string,
): Promise<void> {
  await prisma.mailRead.upsert({
    where: { userId_mailId: { userId, mailId } },
    create: { userId, mailId },
    update: {},
  });
}

/**
 * Creates a mail. The author is marked as having read it (no self-reminder),
 * and the per-day reminder cache is cleared so every user is re-evaluated.
 */
export async function createMail(
  authorId: string,
  title: string | undefined,
  body: string,
): Promise<Mail> {
  const mail = await prisma.mail.create({
    data: { authorId, title: title ?? null, body },
  });
  await markMailRead(authorId, mail.id);

  activeMailsCache = undefined;
  handledToday.clear();
  return mail;
}

/**
 * Returns the number of unread mails to remind `userId` about, or `null` when
 * no reminder is due (no active mails, nothing unread, or already reminded
 * today). At most one reminder per user per UTC day; the `MailNotice` row
 * persists that decision across restarts.
 */
export async function getUnreadNotice(userId: string): Promise<number | null> {
  const now = new Date();
  const today = utcDayKey(now);
  if (handledCacheDay !== today) {
    handledToday.clear();
    handledCacheDay = today;
  }

  const active = await ensureActiveMails(now);
  if (active.length === 0) {
    return null;
  }
  if (handledToday.get(userId) === today) {
    return null;
  }

  const readCount = await prisma.mailRead.count({
    where: { userId, mailId: { in: active.map((mail) => mail.id) } },
  });
  handledToday.set(userId, today);

  const unread = active.length - readCount;
  if (unread <= 0) {
    return null;
  }

  const notice = await prisma.mailNotice.findUnique({ where: { userId } });
  if (notice && isSameUtcDay(notice.lastNotifiedAt, now)) {
    return null;
  }
  await prisma.mailNotice.upsert({
    where: { userId },
    create: { userId, lastNotifiedAt: now },
    update: { lastNotifiedAt: now },
  });
  return unread;
}

/**
 * Physically deletes mails older than {@link MAIL_TTL_MS} and their read
 * receipts, then invalidates the cache. Returns the number of mails removed.
 */
export async function purgeExpiredMails(): Promise<number> {
  const expired = await prisma.mail.findMany({
    where: { createdAt: { lt: expiryCutoff(new Date()) } },
    select: { id: true },
  });
  if (expired.length === 0) {
    return 0;
  }

  const ids = expired.map((mail) => mail.id);
  await prisma.mailRead.deleteMany({ where: { mailId: { in: ids } } });
  await prisma.mail.deleteMany({ where: { id: { in: ids } } });

  activeMailsCache = undefined;
  return ids.length;
}
