import { TimestampStyles, time } from 'discord.js';

/**
 * Formats `date` as a Discord relative timestamp (e.g. "in 3 hours"), which
 * Discord renders in each viewer's own locale and time zone.
 */
export function relativeTimestamp(date: Date): string {
  return time(date, TimestampStyles.RelativeTime);
}
