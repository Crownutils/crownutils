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
} from './models.js';

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
  type EffectInfo,
} from './icons.js';
