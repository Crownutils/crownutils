import { cachedPromise } from './source.js';
import {
  extractIconBlock,
  fetchIconsSource,
} from './crownicles-icons-source.js';

/** Map of location type key (e.g. `vi`, `ci`, `fo`) to its Unicode emote. */
export type MapTypeIcons = Record<string, string>;

/** Loads and caches the map-type icon map once; the promise is evicted on failure. */
export const loadMapTypeIcons = cachedPromise<MapTypeIcons>(() =>
  fetchIconsSource().then((source) => extractIconBlock(source, 'mapTypes')),
);
