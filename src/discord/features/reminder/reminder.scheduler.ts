import {
  claimReminder,
  DUE_BATCH_SIZE,
  getDueReminders,
  getNextReminderDueAt,
  markReminderDelivered,
  markReminderFailed,
  reclaimStuckReminders,
  requeueReminder,
  type DueReminder,
} from '@/core/repositories/index.js';
import { logger } from '@/shared/index.js';
import { toError } from '../../utils/errors.js';
import type { DeliveryResult, ReminderDeliverer } from './reminder.delivery.js';

/** Node's setTimeout 32-bit delay cap (~24.8 days); longer delays are chunked. */
const TIMEOUT_MAX = 2_147_483_647;

/** Delivery attempts (including the first) before a reminder is given up as failed. */
const MAX_DELIVERY_ATTEMPTS = 3;

/** First retry delay; doubles per attempt up to {@link RETRY_CAP_MS}. */
const RETRY_BASE_MS = 30_000;
/** Ceiling of the retry backoff. */
const RETRY_CAP_MS = 15 * 60_000;
/** Reminders delivered in parallel within one batch. */
const DELIVERY_CONCURRENCY = 5;
/** Backstop re-scan interval; self-heals against any timer-bookkeeping bug, never the primary path. */
const SAFETY_NET_MS = 5 * 60_000;

/** Random full-jitter backoff (AWS-style), floored at 1s so a retry never re-fires within the same drain. */
function backoffDelayMs(attempts: number): number {
  const ceiling = Math.min(RETRY_CAP_MS, RETRY_BASE_MS * 2 ** (attempts - 1));
  return Math.max(1000, Math.floor(Math.random() * ceiling));
}

/**
 * Event-driven reminder scheduler: keeps one timer armed on the nearest due
 * reminder and delivers them via {@link ReminderDeliverer}. The database is the
 * source of truth (the timer only avoids polling), so a crash loses nothing:
 * {@link start} recovers and every write re-arms via {@link notifyChanged}.
 */
export class ReminderScheduler {
  private deliver: ReminderDeliverer | null = null;
  private armed: NodeJS.Timeout | null = null;
  private safetyNet: NodeJS.Timeout | null = null;
  private started = false;
  private stopping = false;
  private tickInFlight: Promise<void> | null = null;
  private tickQueued = false;
  /** Guards against concurrent re-arms leaking a timer during create/cancel bursts. */
  private rescheduleSeq = 0;

  /** Recovers orphaned in-flight reminders, drains anything overdue, then arms the timer. */
  public async start(deliver: ReminderDeliverer): Promise<void> {
    if (this.started) return;
    this.started = true;
    this.deliver = deliver;

    const reclaimed = await reclaimStuckReminders();
    if (reclaimed > 0) {
      logger.warn({ reclaimed }, 'Reclaimed in-flight reminders after restart');
    }

    await this.runTick();
    this.armSafetyNet();
  }

  /** Stops arming and waits for any in-flight delivery to settle, so recovery stays clean. */
  public async stop(): Promise<void> {
    this.stopping = true;
    this.clearArmed();
    if (this.safetyNet !== null) {
      clearTimeout(this.safetyNet);
      this.safetyNet = null;
    }
    if (this.tickInFlight) await this.tickInFlight;
  }

  /** Re-arm after a reminder is created or cancelled (the nearest due date may have changed). */
  public notifyChanged(): void {
    if (!this.started || this.stopping) return;
    void this.reschedule();
  }

  private clearArmed(): void {
    if (this.armed !== null) {
      clearTimeout(this.armed);
      this.armed = null;
    }
  }

  /** Arms the single timer on the nearest pending reminder, chunking past the 24.8-day cap. */
  private async reschedule(): Promise<void> {
    const seq = ++this.rescheduleSeq;
    this.clearArmed();
    if (this.stopping) return;

    const next = await getNextReminderDueAt();
    // A newer reschedule ran while we awaited; let it own the timer.
    if (this.stopping || seq !== this.rescheduleSeq || next === null) return;

    const delay = Math.max(
      0,
      Math.min(next.getTime() - Date.now(), TIMEOUT_MAX),
    );
    this.armed = setTimeout(() => this.fire(), delay);
  }

  private fire(): void {
    this.armed = null;
    if (this.stopping) return;
    void this.runTick();
  }

  /** Serializes ticks: a fire during a running tick queues exactly one follow-up. */
  private runTick(): Promise<void> {
    if (this.tickInFlight) {
      this.tickQueued = true;
      return this.tickInFlight;
    }
    const run = this.drainAndReschedule().finally(() => {
      this.tickInFlight = null;
      if (this.tickQueued) {
        this.tickQueued = false;
        void this.runTick();
      }
    });
    this.tickInFlight = run;
    return run;
  }

  /** Delivers every due reminder in bounded batches, then re-arms for the next one. */
  private async drainAndReschedule(): Promise<void> {
    for (;;) {
      if (this.stopping) return;
      const due = await getDueReminders(new Date(), DUE_BATCH_SIZE);
      // Empty is also the early-wake path once a 24.8-day chunk elapsed.
      if (due.length === 0) break;
      await this.deliverBatch(due);
    }
    await this.reschedule();
  }

  private async deliverBatch(due: readonly DueReminder[]): Promise<void> {
    const queue = [...due];
    const worker = async (): Promise<void> => {
      for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
        await this.deliverOne(next);
      }
    };
    const workers = Array.from(
      { length: Math.min(DELIVERY_CONCURRENCY, queue.length) },
      worker,
    );
    await Promise.all(workers);
  }

  /** Claims, delivers, and settles one reminder. Never throws, so failures stay isolated. */
  private async deliverOne(reminder: DueReminder): Promise<void> {
    const deliver = this.deliver;
    if (deliver === null) return;
    if (!(await claimReminder(reminder.id))) return;

    const attempts = reminder.attempts + 1;
    let outcome: DeliveryResult;
    try {
      outcome = await deliver(reminder);
    } catch (error) {
      outcome = {
        ok: false,
        kind: 'transient',
        reason: toError(error).message,
      };
    }

    if (outcome.ok) {
      await markReminderDelivered(reminder.id);
      return;
    }
    if (outcome.kind === 'terminal' || attempts >= MAX_DELIVERY_ATTEMPTS) {
      await markReminderFailed(reminder.id, outcome.reason);
      logger.warn(
        { reminderId: reminder.id, attempts, kind: outcome.kind },
        'Reminder delivery failed permanently',
      );
    } else {
      const retryAt = new Date(Date.now() + backoffDelayMs(attempts));
      await requeueReminder(reminder.id, retryAt, outcome.reason);
      logger.info(
        { reminderId: reminder.id, attempts },
        'Reminder delivery failed, will retry',
      );
    }
  }

  private armSafetyNet(): void {
    if (this.stopping) return;
    this.safetyNet = setTimeout(() => {
      this.safetyNet = null;
      void this.runTick().finally(() => this.armSafetyNet());
    }, SAFETY_NET_MS);
  }
}

/** Production singleton wired to the repository, real clock, and `setTimeout`. */
export const reminderScheduler = new ReminderScheduler();
