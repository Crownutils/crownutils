import { purgeExpiredMails } from '@/core/mails/mail-repository.js';
import { logger } from '@/shared/logger.js';

const PURGE_INTERVAL_MS = 60 * 60 * 1000;

async function runPurge(): Promise<void> {
  try {
    const removed = await purgeExpiredMails();
    if (removed > 0) {
      logger.info(`Purged ${removed} expired mail(s).`);
    }
  } catch (error) {
    logger.error({ error }, 'Failed to purge expired mails.');
  }
}

/** Purges expired mails now, then hourly. Safe to call once at startup. */
export function scheduleMailPurge(): void {
  void runPurge();
  setInterval(() => void runPurge(), PURGE_INTERVAL_MS).unref();
}
