import {
  getCrowniclesLocations,
  getEvents,
  type CrowniclesEvent,
  type CrowniclesLocation,
} from '@/core/crownicles/index.js';
import type { SupportedLocale } from '@/core/types.js';

/**
 * Everything the help center's event pages need, composed from the core
 * loaders once per open: the locations that actually host an event (sorted for
 * the picker), the events grouped by location, and the location-less specials.
 */
export interface CrowniclesHelpData {
  /** Locations with at least one event, sorted by localized name. */
  readonly locations: readonly CrowniclesLocation[];
  readonly eventsByLocation: ReadonlyMap<number, readonly CrowniclesEvent[]>;
  /** Global events with no location trigger (seasonal/date-driven). */
  readonly specialEvents: readonly CrowniclesEvent[];
}

/**
 * Composes the help data for `locale`. The expensive fetches sit behind the
 * core loaders' TTL caches, so this only re-groups/sorts in memory - cheap
 * enough to run once per command open and keep in the interactive state.
 */
export async function loadCrowniclesHelpData(
  locale: SupportedLocale,
): Promise<CrowniclesHelpData> {
  const [locations, events] = await Promise.all([
    getCrowniclesLocations(locale),
    getEvents(locale),
  ]);

  const eventsByLocation = new Map<number, CrowniclesEvent[]>();
  for (const event of events) {
    for (const mapId of event.mapIds) {
      const list = eventsByLocation.get(mapId) ?? [];
      list.push(event);
      eventsByLocation.set(mapId, list);
    }
  }

  return {
    locations: locations
      .filter((location) => eventsByLocation.has(location.id))
      .sort((a, b) => a.name.localeCompare(b.name)),
    eventsByLocation,
    specialEvents: events.filter((event) => event.isSpecial),
  };
}
