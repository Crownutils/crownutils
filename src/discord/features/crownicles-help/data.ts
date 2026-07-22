import {
  getBiomeMaterialTypes,
  getBossLootTables,
  getCrowniclesLocations,
  getEvents,
  getExpeditionLootTables,
  getLocationNames,
  getMapLinks,
  getMapTypeNames,
  getMaterialCraftRecipes,
  getMaterialRarityNames,
  getMaterials,
  getRecipeNames,
  poolDropChance,
  rarityDropChance,
  type CrowniclesEvent,
  type CrowniclesLocation,
  type CrowniclesMaterial,
  type MapLink,
  type MaterialCraftRecipe,
} from '@/core/crownicles/index.js';
import type { SupportedLocale } from '@/core/types.js';

/**
 * Everything the help center's event pages need, composed from the core
 * loaders once per open: the locations that actually host an event (sorted for
 * the picker), the events grouped by location, and the location-less specials.
 */
export interface CrowniclesHelpData {
  /** Locations with at least one event, sorted by localized name. */
  readonly locations: readonly CrowniclesLocation[];
  readonly eventsByLocation: ReadonlyMap<number, readonly CrowniclesEvent[]>;
  /** Global events with no location trigger (seasonal/date-driven). */
  readonly specialEvents: readonly CrowniclesEvent[];
  /** Localized location-type names, for rendering outcome destinations. */
  readonly mapTypeNames: Record<string, string>;
  /** Localized location names by id string, for resolving forced-link destinations. */
  readonly locationNames: Record<string, string>;
  /** The forced map links referenced by outcomes, resolved to their endpoints. */
  readonly mapLinks: ReadonlyMap<number, MapLink>;
}

/** Distinct map-link ids referenced by any outcome across `events`. */
function referencedMapLinkIds(events: readonly CrowniclesEvent[]): number[] {
  const ids = new Set<number>();
  for (const event of events) {
    for (const possibility of event.possibilities) {
      for (const outcome of possibility.outcomes) {
        if (outcome.mapLink !== undefined) ids.add(outcome.mapLink);
      }
    }
  }
  return [...ids];
}

/**
 * Composes the help data for `locale`. The expensive fetches sit behind the
 * core loaders' TTL caches, so this only re-groups/sorts in memory - cheap
 * enough to run once per command open and keep in the interactive state.
 */
export async function loadCrowniclesHelpData(
  locale: SupportedLocale,
): Promise<CrowniclesHelpData> {
  const [locations, events, mapTypeNames, locationNames] = await Promise.all([
    getCrowniclesLocations(locale),
    getEvents(locale),
    getMapTypeNames(locale),
    getLocationNames(locale),
  ]);
  const mapLinks = await getMapLinks(referencedMapLinkIds(events));

  const eventsByLocation = new Map<number, CrowniclesEvent[]>();
  for (const event of events) {
    for (const mapId of event.mapIds) {
      const list = eventsByLocation.get(mapId) ?? [];
      list.push(event);
      eventsByLocation.set(mapId, list);
    }
  }

  return {
    locations: locations
      .filter((location) => eventsByLocation.has(location.id))
      .sort((a, b) => a.name.localeCompare(b.name)),
    eventsByLocation,
    specialEvents: events.filter((event) => event.isSpecial),
    mapTypeNames,
    locationNames,
    mapLinks,
  };
}

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
  /** Expedition terrain code (forest, cave, …); the page resolves its icon/label. */
  readonly terrain: string;
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
  /** Chance from composting (rarity-first, across all materials of that rarity). */
  readonly compostChance: number;
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
  ] = await Promise.all([
    getMaterials(locale),
    getMaterialRarityNames(locale),
    getExpeditionLootTables(),
    getBossLootTables(),
    getCrowniclesLocations(locale),
    getBiomeMaterialTypes(),
    getMaterialCraftRecipes(),
    getRecipeNames(locale),
  ]);

  const materialsByType = new Map<string, CrowniclesMaterial[]>();
  const countByRarity = new Map<number, number>();
  const countByTypeRarity = new Map<string, number>();
  for (const material of materials) {
    const byType = materialsByType.get(material.type) ?? [];
    byType.push(material);
    materialsByType.set(material.type, byType);
    countByRarity.set(
      material.rarity,
      (countByRarity.get(material.rarity) ?? 0) + 1,
    );
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
          compostChance: rarityDropChance(
            material,
            countByRarity.get(material.rarity) ?? 0,
          ),
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
