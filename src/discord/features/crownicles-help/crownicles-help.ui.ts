import type { CrowniclesEvent, EventOutcome } from '@/core/crownicles/index.js';
import { effects, outcomeIcons } from '@/core/crownicles/index.js';
import type { SupportedLocale } from '@/core/types.js';
import {
  type Container,
  SelectActionRow,
  SelectMenu,
  Separator,
  Text,
} from '@/discord/components/index.js';
import { md } from '@/discord/theme/markdown.js';
import { commandMessages } from '@/discord/lang/index.js';
import type { HelpRenderContext } from './page.js';

/** Discord's hard limits on the text a select option can carry. */
const SELECT_LABEL_MAX = 100;
const SELECT_DESCRIPTION_MAX = 100;
/** Options per location page, at Discord's select-menu ceiling. */
export const LOCATIONS_PER_PAGE = 25;

/** Effect whose duration is the outcome's variable `lostTime`, not a fixed base. */
const OCCUPIED_EFFECT_ID = 'occupied';
/** Above this, a duration is treated as permanent and shown as the icon alone. */
const MAX_SHOWN_DURATION_MINUTES = 100_000;
/** Value separators: `|` between stats, `-` between a narrative and its stats. */
const STAT_SEPARATOR = ' | ';
const TEXT_STAT_SEPARATOR = ' - ';

export const CATEGORY_SELECT_ID = 'chelp-category';
export const LOCATION_SELECT_ID = 'chelp-location';
export const LOCATION_PREV_ID = 'chelp-loc-prev';
export const LOCATION_NEXT_ID = 'chelp-loc-next';
export const EVENT_SELECT_ID = 'chelp-event';
export const BACK_TO_LOCATIONS_ID = 'chelp-back-locations';
export const BACK_TO_EVENTS_ID = 'chelp-back-events';

/** The crownicles-help `messages` node for `locale`. */
export function helpMessages(locale: SupportedLocale) {
  return commandMessages(locale, 'commandCrowniclesHelp');
}

/** Shortens `text` to `max` chars, ending on an ellipsis when it had to cut. */
export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/** A select option label from free-form event text (kept within Discord's limit). */
export function eventOptionLabel(text: string, fallback: string): string {
  const trimmed = text.trim();
  return truncate(trimmed.length > 0 ? trimmed : fallback, SELECT_LABEL_MAX);
}

/** `+n` for a gain, `-n` for a loss (the value already carries its sign). */
function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

/** A minute count as `X min`, `X h` or `X h Y min`. */
function formatDuration(minutes: number, locale: SupportedLocale): string {
  const t = helpMessages(locale);
  if (minutes < 60) return t.minutes(minutes);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? t.hours(hours) : t.hoursMinutes(hours, rest);
}

/** The effect part of an outcome summary: its icon, and its duration when known. */
function effectPart(
  outcome: EventOutcome,
  locale: SupportedLocale,
): string | undefined {
  if (outcome.effect === undefined) {
    return outcome.lostTime && outcome.lostTime > 0
      ? `${outcomeIcons.time} ${formatDuration(outcome.lostTime, locale)}`
      : undefined;
  }

  const info = effects[outcome.effect];
  if (info === undefined) return undefined;

  const duration =
    outcome.effect === OCCUPIED_EFFECT_ID
      ? (outcome.lostTime ?? 0)
      : info.durationMinutes;
  return duration > 0 && duration <= MAX_SHOWN_DURATION_MINUTES
    ? `${info.icon} ${formatDuration(duration, locale)}`
    : info.icon;
}

/**
 * Compact icon summary of an outcome's mechanical effects, e.g.
 * `⭐ 172 | 💰 +50 | ❤️ -5 | 🕑 30 min`. Empty when the outcome is purely
 * narrative.
 */
export function outcomeSummary(
  outcome: EventOutcome,
  locale: SupportedLocale,
): string {
  const parts: string[] = [];
  const push = (icon: string, value: string): void => {
    parts.push(`${icon} ${value}`);
  };

  if (outcome.experience > 0) push(outcomeIcons.xp, String(outcome.experience));
  if (outcome.points) push(outcomeIcons.points, signed(outcome.points));
  if (outcome.money) push(outcomeIcons.money, signed(outcome.money));
  if (outcome.health) push(outcomeIcons.health, signed(outcome.health));
  if (outcome.energy) push(outcomeIcons.energy, signed(outcome.energy));
  if (outcome.gems) push(outcomeIcons.gems, signed(outcome.gems));
  if (outcome.tokens) push(outcomeIcons.tokens, signed(outcome.tokens));

  const effect = effectPart(outcome, locale);
  if (effect) parts.push(effect);
  if (outcome.givesItem) parts.push(outcomeIcons.item);
  if (outcome.givesPet) parts.push(outcomeIcons.pet);
  if (outcome.oneshot) parts.push(outcomeIcons.oneshot);
  if (outcome.travels) parts.push(outcomeIcons.travel);
  if (outcome.nextEventId !== undefined) {
    push(outcomeIcons.nextEvent, `#${outcome.nextEventId}`);
  }

  return parts.join(STAT_SEPARATOR);
}

/** The category select, always placed by the router below the page container. */
export function buildCategorySelectRow(
  currentPageId: string,
  context: HelpRenderContext,
): SelectActionRow {
  const t = helpMessages(context.locale);
  const select = new SelectMenu(CATEGORY_SELECT_ID)
    .placeholder(t.categoryPlaceholder)
    .options(
      context.pages.map((page) => ({
        label: page.name(context.locale),
        value: page.id,
        description: truncate(
          page.description(context.locale),
          SELECT_DESCRIPTION_MAX,
        ),
        emoji: page.icon,
        default: page.id === currentPageId,
      })),
    );
  if (context.disabled) select.disabled();
  return new SelectActionRow().set(select);
}

/**
 * Appends an event's full detail to `container`: its intro, then each choice
 * with its possible outcomes and their icon summaries.
 */
export function appendEventDetail(
  container: Container,
  event: CrowniclesEvent,
  locale: SupportedLocale,
): void {
  const t = helpMessages(locale);

  container.add(new Text(event.text), new Separator());
  container.add(new Text(t.outcomesTitle).size('small'));

  for (const possibility of event.possibilities) {
    const block = new Text(md.bold(possibility.text ?? t.autoOutcome));
    for (const outcome of possibility.outcomes) {
      const summary = outcomeSummary(outcome, locale);
      const text = outcome.text?.trim() ?? '';
      const line = [text, summary]
        .filter((part) => part.length > 0)
        .join(TEXT_STAT_SEPARATOR);
      if (line.length > 0) block.newLine(`↳ ${line}`);
    }
    container.add(block);
  }
}
