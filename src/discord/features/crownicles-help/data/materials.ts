import {
  getBiomeMaterialTypes,
  getBossLootTables,
  getCrowniclesLocations,
  getExpeditionLootTables,
  getMaterialCraftRecipes,
  getMaterialRarityNames,
  getMaterials,
  getPlants,
  getRecipeNames,
  poolDropChance,
  rarityDropChance,
  uniformDropChance,
  type CrowniclesMaterial,
  type MaterialCraftRecipe,
} from '@/core/crownicles/index.js';
import type { SupportedLocale } from '@/core/types.js';

/** A resolved boss source that can drop a material, with the drop probability from it. */
export interface MaterialBossSource {
  /** The boss location's type emote, or empty when unknown. */
  readonly icon: string;
  /** The boss location's localized name. */
  readonly name: string;
  /** Probability of getting the material in one draw from this boss (`0`..`1`). */
  readonly chance: number;
}

/** An expedition terrain that can drop a material (terrain key + probability). */
export interface MaterialExpeditionSource {
  /** Expedition terrain code (forest, cave, ...); the page resolves its icon/label. */
  readonly terrain: string;
  readonly chance: number;
}

/** A plant whose compost can yield a material, with the chance it does. */
export interface MaterialCompostSource {
  /** The plant's emote, or `undefined` when the game has none. */
  readonly icon: string | undefined;
  readonly name: string;
  /** Probability that composting one such plant yields the material (`0`..`1`). */
  readonly chance: number;
}

/** The cooking recipe that crafts a material (deterministic, no chance). */
export interface MaterialCookingInfo {
  /** Official recipe name. */
  readonly name: string;
  /** Cooking level required. */
  readonly level: number;
  /** Units produced per craft. */
  readonly quantity: number;
}

/** Every way to obtain one material, each with its drop probability. */
export interface MaterialObtainInfo {
  /** Chance per biome when the `findMaterial` small event fires there. */
  readonly smallEvents: readonly MaterialExpeditionSource[];
  readonly expeditions: readonly MaterialExpeditionSource[];
  readonly bosses: readonly MaterialBossSource[];
  /** Plants whose compost can yield it, best chance first. */
  readonly compost: readonly MaterialCompostSource[];
  /** Present when a cooking recipe crafts this material. */
  readonly cooking?: MaterialCookingInfo;
}

/** What the materials page needs: materials grouped by type, plus display data. */
export interface CrowniclesMaterialsData {
  /** Materials grouped by type, each list sorted by rarity then name. */
  readonly materialsByType: ReadonlyMap<string, readonly CrowniclesMaterial[]>;
  /** Official rarity names by level (`1`..`3`). */
  readonly rarityNames: Record<string, string>;
  /** How to obtain each material (with probabilities), by material id. */
  readonly obtainByMaterial: ReadonlyMap<number, MaterialObtainInfo>;
}

/** Resolves loot-table material ids to the materials themselves (dropping unknown ids). */
function resolvePool(
  ids: readonly number[],
  byId: ReadonlyMap<number, CrowniclesMaterial>,
): CrowniclesMaterial[] {
  return ids
    .map((id) => byId.get(id))
    .filter(
      (material): material is CrowniclesMaterial => material !== undefined,
    );
}

/**
 * Reverses the plants' compost pools into compost sources by material id. A
 * composted plant yields one member of its own pool, picked uniformly, so every
 * member of a three-material pool comes out one time in three.
 */
function compostSourcesByMaterial(
  plants: Awaited<ReturnType<typeof getPlants>>,
): Map<number, MaterialCompostSource[]> {
  const byMaterial = new Map<number, MaterialCompostSource[]>();
  for (const plant of plants) {
    const chance = uniformDropChance(plant.compostMaterials.length);
    for (const materialId of new Set(plant.compostMaterials)) {
      const sources = byMaterial.get(materialId) ?? [];
      sources.push({ icon: plant.icon, name: plant.name, chance });
      byMaterial.set(materialId, sources);
    }
  }
  for (const sources of byMaterial.values()) {
    sources.sort((a, b) => b.chance - a.chance || a.name.localeCompare(b.name));
  }
  return byMaterial;
}

/** Composes the materials page data for `locale` (fetches sit behind TTL caches). */
export async function loadMaterialsData(
  locale: SupportedLocale,
): Promise<CrowniclesMaterialsData> {
  const [
    materials,
    rarityNames,
    expeditionTables,
    bossTables,
    locations,
    biomeTypes,
    craftRecipes,
    recipeNames,
    plants,
  ] = await Promise.all([
    getMaterials(locale),
    getMaterialRarityNames(locale),
    getExpeditionLootTables(),
    getBossLootTables(),
    getCrowniclesLocations(locale),
    getBiomeMaterialTypes(),
    getMaterialCraftRecipes(),
    getRecipeNames(locale),
    getPlants(locale),
  ]);

  const materialsByType = new Map<string, CrowniclesMaterial[]>();
  const countByTypeRarity = new Map<string, number>();
  for (const material of materials) {
    const byType = materialsByType.get(material.type) ?? [];
    byType.push(material);
    materialsByType.set(material.type, byType);
    const typeRarity = `${material.type}:${material.rarity}`;
    countByTypeRarity.set(
      typeRarity,
      (countByTypeRarity.get(typeRarity) ?? 0) + 1,
    );
  }
  for (const list of materialsByType.values()) {
    list.sort((a, b) => a.rarity - b.rarity || a.name.localeCompare(b.name));
  }

  const byId = new Map(materials.map((material) => [material.id, material]));
  const locationById = new Map(
    locations.map((location) => [location.id, location]),
  );
  const expeditionPools = Object.entries(expeditionTables).map(
    ([terrain, ids]) => ({ terrain, pool: resolvePool(ids, byId) }),
  );
  const bossPools = [...bossTables].map(([mapId, ids]) => ({
    location: locationById.get(mapId),
    pool: resolvePool(ids, byId),
  }));
  const craftByMaterial = new Map<number, MaterialCraftRecipe>();
  for (const recipe of craftRecipes) {
    const existing = craftByMaterial.get(recipe.outputMaterialId);
    if (existing === undefined || recipe.level < existing.level) {
      craftByMaterial.set(recipe.outputMaterialId, recipe);
    }
  }
  const compostByMaterial = compostSourcesByMaterial(plants);

  const obtainByMaterial = new Map<number, MaterialObtainInfo>(
    materials.map((material) => {
      /** Chance once the small event targets the material's type; split per biome below. */
      const typeChance = rarityDropChance(
        material,
        countByTypeRarity.get(`${material.type}:${material.rarity}`) ?? 0,
      );
      const craft = craftByMaterial.get(material.id);
      return [
        material.id,
        {
          smallEvents: Object.entries(biomeTypes)
            .filter(([, types]) => types.includes(material.type))
            .map(([biome, types]) => ({
              terrain: biome,
              chance: typeChance / types.length,
            })),
          expeditions: expeditionPools
            .filter(({ pool }) =>
              pool.some((entry) => entry.id === material.id),
            )
            .map(({ terrain, pool }) => ({
              terrain,
              chance: poolDropChance(material, pool),
            })),
          bosses: bossPools
            .filter(
              ({ location, pool }) =>
                location !== undefined &&
                pool.some((entry) => entry.id === material.id),
            )
            .map(({ location, pool }) => ({
              icon: location!.icon ?? '',
              name: location!.name,
              chance: poolDropChance(material, pool),
            })),
          compost: compostByMaterial.get(material.id) ?? [],
          ...(craft
            ? {
                cooking: {
                  name: recipeNames[craft.id] ?? craft.id,
                  level: craft.level,
                  quantity: craft.quantity,
                },
              }
            : {}),
        },
      ];
    }),
  );

  return { materialsByType, rarityNames, obtainByMaterial };
}
