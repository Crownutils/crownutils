/**
 * Repositories that read public Crownicles data at runtime (fetched over the
 * network per the project NOTICE) and cache it in memory.
 */

export {
  getItems,
  ITEM_CATEGORIES,
  type CrowniclesItem,
  type ItemCategory,
} from './items.js';

export {
  getCrowniclesMapGraph,
  getContinentGraph,
  type CrowniclesMap,
  type CrowniclesMapLocation,
  type CrowniclesMapLink,
} from './map.js';
