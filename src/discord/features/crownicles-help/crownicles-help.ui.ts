import type { CrowniclesEvent, EventOutcome } from '@/core/crownicles/index.js';
import {
  effects,
  locationTypeIcons,
  outcomeIcons,
} from '@/core/crownicles/index.js';
import type { SupportedLocale } from '@/core/types.js';
import {
  Button,
  ButtonActionRow,
  type Container,
  createContainer,
  SelectActionRow,
  SelectMenu,
  Separator,
  Text,
} from '@/discord/components/index.js';
import { withIcon } from '@/discord/theme/icons.js';
import { commandMessages } from '@/discord/lang/index.js';
import { countPages, paginate } from '@/discord/utils/pagination.js';
import type { CrowniclesEventsData } from './data/events.js';
import { formatDuration } from './format.js';
import { helpIcons } from './icons.js';
import type { HelpRenderContext, HelpState } from './page.js';

// Re-exported so every help page keeps sourcing its pagination from this module.
export {
  appendPaginationControls,
  clampPage,
} from '@/discord/utils/pagination.js';

/** Discord's hard limits on the text a select option can carry. */
export const SELECT_LABEL_MAX = 100;
export const SELECT_DESCRIPTION_MAX = 100;
/** Options per picker page, at Discord's select-menu ceiling. */
export const PICKER_PAGE_SIZE = 25;

/** Effect whose duration is the outcome's variable `lostTime`, not a fixed base. */
const OCCUPIED_EFFECT_ID = 'occupied';
/** Above this, a duration is treated as permanent and shown as the icon alone. */
const MAX_SHOWN_DURATION_MINUTES = 100_000;
/** Separator between an outcome's stats. */
const STAT_SEPARATOR = ' | ';

/** Custom ids of the help center's controls, matched by the router and its pages. */
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

/** Total picker pages needed for `length` options (at least one). */
export function pickerPageCount(length: number): number {
  return countPages(length, PICKER_PAGE_SIZE);
}

/** The clamped current picker page and its slice of `items`. */
export function pickerPage<T>(
  items: readonly T[],
  requestedPage: number | undefined,
): { page: number; pageCount: number; slice: readonly T[] } {
  return paginate(items, requestedPage, PICKER_PAGE_SIZE);
}

/** One choice of a picker step: its line in the list, and its select option. */
export interface PickerEntry {
  /** Line shown in the list above the menu, already composed. */
  readonly line: string;
  /** Option label; truncated to Discord's limit. */
  readonly label: string;
  /** Option value, echoed back by the interaction. */
  readonly value: string;
  /** Option description; truncated, and omitted when empty. */
  readonly description?: string | undefined;
  /** Emote for both the list line and the option; omitted when absent. */
  readonly icon?: string | undefined;
}

/**
 * The listing-plus-menu every browse step is built from: the choices spelled
 * out as readable lines, then the same choices as a select menu. Shared by the
 * materials, equipment and recipes pages, which differ only in how they compose
 * each entry.
 */
export function appendPickerStep(
  container: Container,
  options: {
    readonly selectId: string;
    readonly placeholder: string;
    readonly entries: readonly PickerEntry[];
    readonly disabled: boolean;
  },
): void {
  const list = new Text('');
  for (const entry of options.entries) {
    list.newLine(new Text(entry.line).icon(entry.icon));
  }
  container.add(list, new Separator());

  const select = new SelectMenu(options.selectId)
    .placeholder(options.placeholder)
    .options(
      options.entries.map((entry) => ({
        label: truncate(entry.label, SELECT_LABEL_MAX),
        value: entry.value,
        ...(entry.description
          ? { description: truncate(entry.description, SELECT_DESCRIPTION_MAX) }
          : {}),
        ...(entry.icon ? { emoji: entry.icon } : {}),
      })),
    );
  if (options.disabled) select.disabled();
  container.add(new SelectActionRow().set(select));
}

/** Adds a single back button below the current step. */
export function appendBackButton(
  container: Container,
  customId: string,
  label: string,
  context: HelpRenderContext,
): void {
  const back = new Button(customId).color('secondary').label(label);
  if (context.disabled) back.disabled();
  container.add(new ButtonActionRow().add(back));
}

/** The standard page container: emote + title line, subtle intro, separator. */
export function createHelpPageContainer(
  icon: string,
  name: string,
  intro: string,
): Container {
  return createContainer('brand').add(
    new Text(name).icon(icon).title(),
    new Text(intro).size('subtle'),
    new Separator(),
  );
}

/** Adds the shared loading/error line shown while a page's data is missing. */
export function appendLoadFallback(
  container: Container,
  state: HelpState,
  locale: SupportedLocale,
): void {
  const t = helpMessages(locale);
  container.add(
    new Text(state.loadError ? t.loadError : t.loading).size('subtle'),
  );
}

/** `+n` for a gain, `-n` for a loss (the value already carries its sign). */
function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

/** Time lost (occupied effect), as `🕑 30 min perdues`, or `undefined` if none. */
function timeLostPart(
  outcome: EventOutcome,
  locale: SupportedLocale,
): string | undefined {
  const minutes = outcome.lostTime ?? 0;
  if (minutes <= 0) return undefined;
  const t = helpMessages(locale);
  return withIcon(
    outcomeIcons.time,
    `${formatDuration(minutes, locale)} ${t.labels.timeLost}`,
  );
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
    ? withIcon(info.icon, formatDuration(info.durationMinutes, locale))
    : info.icon;
}

/** The location(s) a forced map link connects, joined by `↔`, or the bare compass. */
function forcedLinkLabel(
  outcome: EventOutcome,
  data: CrowniclesEventsData,
): string {
  const link =
    outcome.mapLink !== undefined
      ? data.mapLinks.get(outcome.mapLink)
      : undefined;
  const names = link
    ? [link.startMap, link.endMap]
        .map((id) => data.locationNames[String(id)])
        .filter((name): name is string => Boolean(name))
    : [];
  return names.length > 0
    ? withIcon(outcomeIcons.travel, names.join(' ↔ '))
    : outcomeIcons.travel;
}

/** Destination(s) an outcome sends the player to, or `undefined` when it doesn't travel. */
function travelPart(
  outcome: EventOutcome,
  locale: SupportedLocale,
  data: CrowniclesEventsData,
): string | undefined {
  const typeLabel = (code: string): string => {
    const icon = locationTypeIcons[code] ?? '';
    const name = data.mapTypeNames[code];
    return name ? withIcon(icon, name) : icon || code;
  };
  if (outcome.mapTypeDestinations?.length) {
    return withIcon(
      outcomeIcons.travel,
      outcome.mapTypeDestinations.map(typeLabel).join(', '),
    );
  }
  if (outcome.mapTypeExclusions?.length) {
    const except = helpMessages(locale).labels.travelExcept;
    return withIcon(
      outcomeIcons.travel,
      `${except} ${outcome.mapTypeExclusions.map(typeLabel).join(', ')}`,
    );
  }
  return outcome.mapLink !== undefined
    ? forcedLinkLabel(outcome, data)
    : undefined;
}

/**
 * Compact icon summary of an outcome's mechanical effects, e.g.
 * `⭐ +172 XP | 💰 +50 argent | 💔 -5 PV`. Empty when the outcome is inert.
 */
export function outcomeSummary(
  outcome: EventOutcome,
  locale: SupportedLocale,
  data: CrowniclesEventsData,
): string {
  const l = helpMessages(locale).labels;
  const parts: string[] = [];
  const stat = (icon: string, value: string, label: string): void => {
    parts.push(withIcon(icon, `${value} ${label}`));
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
  if (outcome.givesItem) parts.push(withIcon(outcomeIcons.item, l.item));
  if (outcome.givesPet) parts.push(withIcon(outcomeIcons.pet, l.pet));
  if (outcome.oneshot) parts.push(outcomeIcons.oneshot);
  const travel = travelPart(outcome, locale, data);
  if (travel) parts.push(travel);
  if (outcome.nextEventId !== undefined) {
    parts.push(withIcon(outcomeIcons.nextEvent, `#${outcome.nextEventId}`));
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
  data: CrowniclesEventsData,
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
      possibility.emoji ??
      (possibility.key === 'end' ? helpIcons.endChoice : '');
    const name = possibility.text ?? t.autoOutcome;
    const block = new Text(name).bold().icon(emoji);
    possibility.outcomes.forEach((outcome, index) => {
      const summary = outcomeSummary(outcome, locale, data);
      block.newLine(`${index + 1}. ${summary.length > 0 ? summary : '-'}`);
    });
    container.add(block);
  }
}
