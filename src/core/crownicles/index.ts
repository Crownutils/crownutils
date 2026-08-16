/**
 * Reads public Crownicles game data at runtime (fetched over the network per
 * the project NOTICE) and caches it in memory. The only hardcoded content is
 * the small, stable emote tables in {@link ./icons.js} and the numeric
 * balance constants in {@link ./experience.js} and {@link ./item-constants.js}
 * -- both allowed under the project NOTICE as plain facts/data, never source
 * code.
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
  getCookingGradeNames,
  getPlantNames,
  getFoodNames,
  getItemNames,
} from './models.js';

export {
  ITEM_CATEGORIES,
  FIGHT_ITEM_NATURES,
  TIME_SPEEDUP_NATURE,
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

export { getPlants, type CrowniclesPlant } from './plants.js';

export {
  getCookingRecipes,
  getCookingRules,
  getRecipeShopCosts,
  getRecipeTypeIcons,
  getFoodIcons,
  RECIPE_OUTPUT_TYPES,
  type CookingGrade,
  type CookingRules,
  type RecipeShopCosts,
  type CrowniclesRecipe,
  type MaterialRecipe,
  type PotionRecipe,
  type PetFoodRecipe,
  type RecipeOutputType,
  type RecipePlantCost,
  type RecipeMaterialCost,
  type RecipePetFood,
} from './recipes.js';

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

export {
  computeOutcomeExperience,
  computeExperienceNeededToLevelUp,
  type OutcomeExperienceInputs,
} from './experience.js';
