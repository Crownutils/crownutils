/**
 * Reads public Crownicles game data at runtime (fetched over the network per
 * the project NOTICE) and caches it in memory. Nothing is vendored except the
 * small, stable emote tables in {@link ./icons.js}.
 */

export {
  getCrowniclesLocations,
  type CrowniclesLocation,
} from './locations.js';

export {
  getMapTypeNames,
  getLocationNames,
  getMaterialRarityNames,
  getRecipeNames,
  getItemNames,
} from './models.js';

export {
  ITEM_CATEGORIES,
  FIGHT_ITEM_NATURES,
  MAX_UPGRADE_LEVEL,
  type ItemCategory,
} from './item-constants.js';

export {
  getItems,
  getItemLangStrings,
  formatNatureEffect,
  isMainItem,
  type CrowniclesItem,
  type CrowniclesMainItem,
  type CrowniclesSupportItem,
  type ItemLangStrings,
} from './items.js';

export {
  getUpgradeDistinctCounts,
  getItemMaterialPools,
  computeUpgradeMaterials,
  computeBaseMainStat,
  applyUpgradeLevel,
  computeItemValue,
  type UpgradeMaterialNeed,
} from './item-upgrades.js';

export { getMapLinks, type MapLink } from './map-links.js';

export {
  getMaterials,
  MATERIAL_TYPES,
  type CrowniclesMaterial,
  type MaterialType,
} from './materials.js';

export {
  getExpeditionLootTables,
  getBossLootTables,
  getBiomeMaterialTypes,
  getMaterialCraftRecipes,
  type ExpeditionLootTables,
  type BossLootTables,
  type BiomeMaterialTypes,
  type MaterialCraftRecipe,
} from './material-sources.js';

export { poolDropChance, rarityDropChance } from './material-drops.js';

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
  itemCategoryIcons,
  itemRarityIcons,
  itemNatureIcons,
  itemStatIcons,
  type EffectInfo,
} from './icons.js';
