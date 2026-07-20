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
/** Separator between an outcome's stats. */
const STAT_SEPARATOR = ' | ';
/** Stand-in emote for the auto-resolved `end` choice, which has no reaction icon. */
const END_CHOICE_EMOJI = '🔚';

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

/** Time lost (occupied effect), as `🕑 30 min perdues`, or `undefined` if none. */
function timeLostPart(
  outcome: EventOutcome,
  locale: SupportedLocale,
): string | undefined {
  const minutes = outcome.lostTime ?? 0;
  if (minutes <= 0) return undefined;
  const t = helpMessages(locale);
  return `${outcomeIcons.time} ${formatDuration(minutes, locale)} ${t.labels.timeLost}`;
}

/** An alteration effect, as its icon and duration (e.g. `😴 3 h`); icon alone if permanent. */
function effectPart(
  outcome: EventOutcome,
  locale: SupportedLocale,
): string | undefined {
  if (outcome.effect === undefined || outcome.effect === OCCUPIED_EFFECT_ID) {
    return timeLostPart(outcome, locale);
  }
  const info = effects[outcome.effect];
  if (info === undefined) return undefined;
  return info.durationMinutes > 0 &&
    info.durationMinutes <= MAX_SHOWN_DURATION_MINUTES
    ? `${info.icon} ${formatDuration(info.durationMinutes, locale)}`
    : info.icon;
}

/**
 * Compact icon summary of an outcome's mechanical effects, e.g.
 * `⭐ +172 XP | 💰 +50 argent | 💔 -5 PV`. Empty when the outcome is inert.
 */
export function outcomeSummary(
  outcome: EventOutcome,
  locale: SupportedLocale,
): string {
  const l = helpMessages(locale).labels;
  const parts: string[] = [];
  const stat = (icon: string, value: string, label: string): void => {
    parts.push(`${icon} ${value} ${label}`);
  };

  if (outcome.experience > 0) {
    stat(outcomeIcons.xp, `+${outcome.experience}`, l.xp);
  }
  if (outcome.points)
    stat(outcomeIcons.points, signed(outcome.points), l.points);
  if (outcome.money) {
    const icon =
      outcome.money > 0 ? outcomeIcons.money : outcomeIcons.moneyLoss;
    stat(icon, signed(outcome.money), l.money);
  }
  if (outcome.health) {
    const icon =
      outcome.health > 0 ? outcomeIcons.health : outcomeIcons.healthLoss;
    stat(icon, signed(outcome.health), l.health);
  }
  if (outcome.energy)
    stat(outcomeIcons.energy, signed(outcome.energy), l.energy);
  if (outcome.gems) stat(outcomeIcons.gems, signed(outcome.gems), l.gems);
  if (outcome.tokens)
    stat(outcomeIcons.tokens, signed(outcome.tokens), l.tokens);

  const effect = effectPart(outcome, locale);
  if (effect) parts.push(effect);
  if (outcome.givesItem) parts.push(`${outcomeIcons.item} ${l.item}`);
  if (outcome.givesPet) parts.push(`${outcomeIcons.pet} ${l.pet}`);
  if (outcome.oneshot) parts.push(outcomeIcons.oneshot);
  if (outcome.travels) parts.push(outcomeIcons.travel);
  if (outcome.nextEventId !== undefined) {
    parts.push(`${outcomeIcons.nextEvent} #${outcome.nextEventId}`);
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
 * Appends an event's detail to `container`: its intro, then each choice as an
 * emote + name header followed by its numbered outcomes' icon summaries. The
 * outcome narratives are omitted on purpose (they blow past the message limit).
 */
export function appendEventDetail(
  container: Container,
  event: CrowniclesEvent,
  locale: SupportedLocale,
): void {
  const t = helpMessages(locale);

  container.add(new Text(event.text), new Separator());
  container.add(new Text(t.outcomesTitle).size('small'));

  // The auto-resolved `end` choice is listed last, as in the game.
  const ordered = [...event.possibilities].sort(
    (a, b) => Number(a.key === 'end') - Number(b.key === 'end'),
  );
  for (const possibility of ordered) {
    const emoji =
      possibility.emoji ?? (possibility.key === 'end' ? END_CHOICE_EMOJI : '');
    const name = possibility.text ?? t.autoOutcome;
    const block = new Text(`${emoji} ${md.bold(name)}`.trimStart());
    possibility.outcomes.forEach((outcome, index) => {
      const summary = outcomeSummary(outcome, locale);
      block.newLine(`${index + 1}. ${summary.length > 0 ? summary : '—'}`);
    });
    container.add(block);
  }
}
