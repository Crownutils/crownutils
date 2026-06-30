import { ITEM_CATEGORIES, type ItemCategory } from './items.js';
import { cachedPromise, fetchCrowniclesText } from './source.js';

/** Per-category map of item id (as string) to its Unicode emote. */
export type ItemIcons = Record<ItemCategory, Record<string, string>>;

const ICONS_SOURCE_PATH = 'Lib/src/CrowniclesIcons.ts';

/** Matches `<id>: "<emote>"` pairs inside a category block. */
const ICON_PAIR = /(\d+):\s*"((?:[^"\\]|\\.)*)"/g;

/**
 * Extracts the `{ id: emote }` map of one category from the icons source.
 * Brace-matches the category's value object so nested or later blocks are not
 * captured. Returns an empty map if the category block is absent.
 */
function parseCategoryIcons(
  valueObject: string,
  category: ItemCategory,
): Record<string, string> {
  const header = new RegExp(`\\n\\t${category}:\\s*\\{\\n`).exec(valueObject);
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
  const icons: Record<string, string> = {};
  for (const match of block.matchAll(ICON_PAIR)) {
    const [, id, emote] = match;
    if (id !== undefined && emote !== undefined) {
      icons[id] = emote;
    }
  }
  return icons;
}

/**
 * Parses the four item-icon maps out of the `CrowniclesIcons.ts` source. The
 * values are standard Unicode emotes, so they are reusable as-is (no Discord
 * custom emoji). The leading type declaration is dropped by splitting on the
 * object literal's `} = {`.
 */
function parseItemIcons(source: string): ItemIcons {
  const valueObject = source.split('} = {')[1] ?? source;
  const icons = {} as ItemIcons;
  for (const category of ITEM_CATEGORIES) {
    icons[category] = parseCategoryIcons(valueObject, category);
  }
  return icons;
}

/** Loads and caches the item-icon maps once; the promise is evicted on failure. */
export const loadItemIcons = cachedPromise(() =>
  fetchCrowniclesText(ICONS_SOURCE_PATH).then(parseItemIcons),
);
