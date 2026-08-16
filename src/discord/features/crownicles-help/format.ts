import {
  formatNatureEffect,
  TIME_SPEEDUP_NATURE,
} from '@/core/crownicles/index.js';
import type { SupportedLocale } from '@/core/types.js';
import { commandMessages } from '@/discord/lang/index.js';

/**
 * Value formatting shared by the help center's data loaders and its pages.
 * These turn game numbers into localized wording, so they need the language
 * pack but none of the component layer -- keeping them out of
 * `crownicles-help.ui.ts` is what lets `data/*.ts` stay free of discord.js.
 */

/** The crownicles-help `messages` node for `locale`. */
function messages(locale: SupportedLocale) {
  return commandMessages(locale, 'commandCrowniclesHelp');
}

/** A minute count as `X min`, `X h` or `X h Y min`. */
export function formatDuration(
  minutes: number,
  locale: SupportedLocale,
): string {
  const t = messages(locale);
  if (minutes < 60) return t.minutes(minutes);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? t.hours(hours) : t.hoursMinutes(hours, rest);
}

/**
 * A support item's localized effect line, power substituted. The time-speedup
 * nature carries its power as a minute count rather than a plain amount, so it
 * goes through {@link formatDuration} the way the game's own display does.
 */
export function natureEffectLine(
  template: string,
  nature: number,
  power: number,
  locale: SupportedLocale,
): string {
  return formatNatureEffect(
    template,
    nature === TIME_SPEEDUP_NATURE ? formatDuration(power, locale) : power,
  );
}
