/**
 * Reads public Crownicles game data at runtime (fetched over the network per
 * the project NOTICE) and caches it in memory. Nothing is vendored except the
 * small, stable emote tables in {@link ./icons.js}.
 */

export {
  getCrowniclesLocations,
  type CrowniclesLocation,
} from './locations.js';

export { getMapTypeNames, getLocationNames } from './models.js';

export { getMapLinks, type MapLink } from './map-links.js';

export {
  getEvents,
  type CrowniclesEvent,
  type EventOutcome,
  type EventPossibility,
} from './events.js';

export {
  outcomeIcons,
  effects,
  locationTypeIcons,
  type EffectInfo,
} from './icons.js';
