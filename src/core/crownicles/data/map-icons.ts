import { cachedPromise, fetchCrowniclesText } from './source.js';

/** Map of location type key (e.g. `vi`, `ci`, `fo`) to its Unicode emote. */
export type MapTypeIcons = Record<string, string>;

const ICONS_SOURCE_PATH = 'Lib/src/CrowniclesIcons.ts';

/** Matches `<typeKey>: "<emote>"` pairs inside the `mapTypes` block. */
const ICON_PAIR = /(\w+):\s*"((?:[^"\\]|\\.)*)"/g;

/**
 * Extracts the `{ typeKey: emote }` map from the `mapTypes` block of the icons
 * source. Brace-matches the block's value object so later blocks are not
 * captured. Returns an empty map if the block is absent.
 */
function parseMapTypeIcons(valueObject: string): MapTypeIcons {
  const header = /\n\tmapTypes:\s*\{\n/.exec(valueObject);
  if (!header) {
    return {};
  }

  let depth = 1;
  let end = header.index + header[0].length;
  while (depth > 0 && end < valueObject.length) {
    const char = valueObject[end++];
    if (char === '{') depth++;
    else if (char === '}') depth--;
  }

  const block = valueObject.slice(header.index, end);
  const icons: MapTypeIcons = {};
  for (const match of block.matchAll(ICON_PAIR)) {
    const [, typeKey, emote] = match;
    if (typeKey !== undefined && emote !== undefined) {
      icons[typeKey] = emote;
    }
  }
  return icons;
}

/**
 * Loads and caches the map-type icon map once; the promise is evicted on
 * failure so the next call retries. The leading type declaration is dropped by
 * splitting on the object literal's `} = {`, mirroring the item icon loader.
 */
export const loadMapTypeIcons = cachedPromise<MapTypeIcons>(() =>
  fetchCrowniclesText(ICONS_SOURCE_PATH).then((source) =>
    parseMapTypeIcons(source.split('} = {')[1] ?? source),
  ),
);
