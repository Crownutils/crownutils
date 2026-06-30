import { ITEM_CATEGORIES, type ItemCategory } from './items.js';
import { cachedPromise } from './source.js';
import {
  extractIconBlock,
  fetchIconsSource,
} from './crownicles-icons-source.js';

/** Per-category map of item id (as string) to its Unicode emote. */
export type ItemIcons = Record<ItemCategory, Record<string, string>>;

/**
 * Parses the four item-icon maps out of the `CrowniclesIcons.ts` source. The
 * values are standard Unicode emotes, reusable as-is (no Discord custom emoji).
 * Item ids are numeric, hence the `\d+` key pattern.
 */
function parseItemIcons(source: string): ItemIcons {
  const icons = {} as ItemIcons;
  for (const category of ITEM_CATEGORIES) {
    icons[category] = extractIconBlock(source, category, '\\d+');
  }
  return icons;
}

/** Loads and caches the item-icon maps once; the promise is evicted on failure. */
export const loadItemIcons = cachedPromise(() =>
  fetchIconsSource().then(parseItemIcons),
);
