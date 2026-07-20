import { TtlCache } from '@/core/cache/ttl-cache.js';
import type { SupportedLocale } from '@/core/types.js';
import { computeOutcomeExperience } from './experience.js';
import {
  fetchCrowniclesJson,
  HTTP_CONCURRENCY,
  listCrowniclesDir,
  mapWithConcurrency,
  numericIds,
} from './source.js';

/** Locales the bot serves; a lifetime bound sized to hold every one at once. */
const MAX_CACHED_LOCALES = 4;
/** Game data changes rarely; a long TTL keeps it warm while still self-healing. */
const DATA_TTL_MS = 12 * 60 * 60 * 1000;

/**
 * One possible result of a choice: its localized narrative plus the mechanical
 * rewards/penalties it applies, kept as-is so the UI decides which to show.
 * Numeric fields are omitted when the outcome does not change them.
 */
export interface EventOutcome {
  /** Localized result text; `undefined` if the game ships none for this key. */
  readonly text: string | undefined;
  readonly lostTime?: number;
  readonly health?: number;
  readonly money?: number;
  readonly energy?: number;
  readonly gems?: number;
  readonly tokens?: number;
  /** Effective experience gained, derived from the game formula (not just `bonusExperience`). */
  readonly experience: number;
  /** Explicit bonus points declared by the outcome. */
  readonly points?: number;
  /** Alteration `effect` id (e.g. `occupied`, `sleeping`), or `undefined`. */
  readonly effect?: string;
  readonly givesItem: boolean;
  readonly givesPet: boolean;
  readonly oneshot: boolean;
  /** True when the outcome forces travel (a map link or a destination pick). */
  readonly travels: boolean;
  /** Forced follow-up event id, or `undefined`. */
  readonly nextEventId?: number;
}

/** One choice a player can make on an event, with its possible outcomes. */
export interface EventPossibility {
  readonly key: string;
  /** Localized choice label; `undefined` for auto-resolved keys (e.g. `end`). */
  readonly text: string | undefined;
  readonly outcomes: readonly EventOutcome[];
}

/** A Crownicles "big event", merging its game logic with its localized text. */
export interface CrowniclesEvent {
  readonly id: number;
  /** Localized intro narrative shown when the event triggers. */
  readonly text: string;
  readonly tags: readonly string[];
  /** Map ids this event triggers on; empty for global/special events. */
  readonly mapIds: readonly number[];
  /** True when no trigger is tied to a location (date-driven seasonal events). */
  readonly isSpecial: boolean;
  readonly possibilities: readonly EventPossibility[];
}

/** Raw `Core/resources/events/<id>.json` shape, narrowed to the fields we read. */
interface RawEvent {
  readonly triggers?: readonly { mapId?: number }[];
  readonly tags?: readonly string[];
  readonly possibilities?: Record<
    string,
    { outcomes?: Record<string, RawOutcome> }
  >;
}

/** Raw outcome shape, narrowed to the `PossibilityOutcome` fields we display. */
interface RawOutcome {
  readonly lostTime?: number;
  readonly health?: number;
  readonly money?: number;
  readonly energy?: number;
  readonly gems?: number;
  readonly tokens?: number;
  readonly bonusExperience?: number;
  readonly bonusPoints?: number;
  readonly effect?: string;
  readonly randomItem?: unknown;
  readonly randomPet?: unknown;
  readonly givePet?: unknown;
  readonly oneshot?: boolean;
  readonly nextEvent?: number;
  readonly mapLink?: number;
  readonly mapTypesDestination?: readonly string[];
}

/** Raw `Lang/<locale>/events.json` shape: text keyed by event id then by choice. */
type RawLangEvents = Record<
  string,
  {
    text?: string;
    possibilities?: Record<
      string,
      { text?: string; outcomes?: Record<string, unknown> }
    >;
  }
>;

const EVENTS_DIR = 'Core/resources/events';

const cache = new TtlCache<SupportedLocale, CrowniclesEvent[]>(
  MAX_CACHED_LOCALES,
  DATA_TTL_MS,
);

/** `{ key: value }`, or `{}` when `value` is absent, so optional keys stay unset. */
function opt<K extends string, V>(
  key: K,
  value: V | undefined,
): { [P in K]?: V } {
  return value === undefined ? {} : ({ [key]: value } as { [P in K]?: V });
}

/** Merges a resource outcome with its localized text into an {@link EventOutcome}. */
function mergeOutcome(raw: RawOutcome, text: unknown): EventOutcome {
  return {
    text: typeof text === 'string' ? text : undefined,
    experience: computeOutcomeExperience({
      health: raw.health,
      money: raw.money,
      effect: raw.effect,
      oneshot: raw.oneshot,
      givesRandomItem: raw.randomItem !== undefined,
      bonusExperience: raw.bonusExperience,
    }),
    givesItem: raw.randomItem !== undefined,
    givesPet: raw.randomPet !== undefined || raw.givePet !== undefined,
    oneshot: raw.oneshot === true,
    travels: raw.mapLink !== undefined || raw.mapTypesDestination !== undefined,
    ...opt('lostTime', raw.lostTime),
    ...opt('health', raw.health),
    ...opt('money', raw.money),
    ...opt('energy', raw.energy),
    ...opt('gems', raw.gems),
    ...opt('tokens', raw.tokens),
    ...opt('points', raw.bonusPoints),
    ...opt('effect', raw.effect),
    ...opt('nextEventId', raw.nextEvent),
  };
}

/** Builds one possibility, unioning the resource's outcome keys with the lang's. */
function mergePossibility(
  key: string,
  rawOutcomes: Record<string, RawOutcome>,
  langPossibility:
    { text?: string; outcomes?: Record<string, unknown> } | undefined,
): EventPossibility {
  const langOutcomes = langPossibility?.outcomes ?? {};
  const outcomeKeys = numericIds(
    Object.keys({ ...rawOutcomes, ...langOutcomes }).map((k) => `${k}.json`),
  ).map(String);

  return {
    key,
    text: langPossibility?.text,
    outcomes: outcomeKeys.map((n) =>
      mergeOutcome(rawOutcomes[n] ?? {}, langOutcomes[n]),
    ),
  };
}

/** Merges a resource event with its localized entry into a {@link CrowniclesEvent}. */
function mergeEvent(
  id: number,
  raw: RawEvent,
  lang: RawLangEvents[string] | undefined,
): CrowniclesEvent {
  const mapIds = [
    ...new Set(
      (raw.triggers ?? [])
        .map((trigger) => trigger.mapId)
        .filter((mapId): mapId is number => typeof mapId === 'number'),
    ),
  ];

  const rawPossibilities = raw.possibilities ?? {};
  const possibilities = Object.keys(rawPossibilities).map((key) =>
    mergePossibility(
      key,
      rawPossibilities[key]?.outcomes ?? {},
      lang?.possibilities?.[key],
    ),
  );

  return {
    id,
    text: lang?.text ?? '',
    tags: raw.tags ?? [],
    mapIds,
    isSpecial: mapIds.length === 0,
    possibilities,
  };
}

/** Fetches every event's logic and merges in its `locale` text, in one pass. */
async function loadEvents(locale: SupportedLocale): Promise<CrowniclesEvent[]> {
  const [langEvents, files] = await Promise.all([
    fetchCrowniclesJson<RawLangEvents>(`Lang/${locale}/events.json`),
    listCrowniclesDir(EVENTS_DIR),
  ]);
  const ids = numericIds(files);

  const raw = await mapWithConcurrency(ids, HTTP_CONCURRENCY, (id) =>
    fetchCrowniclesJson<RawEvent>(`${EVENTS_DIR}/${id}.json`),
  );

  return ids.map((id, index) =>
    mergeEvent(id, raw[index]!, langEvents[String(id)]),
  );
}

/**
 * Every Crownicles event for `locale`, fetched from the public repo on first
 * access and cached per locale ({@link DATA_TTL_MS}). A failed load throws
 * before caching, so the next call retries.
 */
export function getEvents(locale: SupportedLocale): Promise<CrowniclesEvent[]> {
  return cache.getOrLoad(locale, loadEvents);
}
