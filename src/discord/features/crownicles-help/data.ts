import {
  applyUpgradeLevel,
  computeBaseMainStat,
  computeItemValue,
  computeUpgradeMaterials,
  FIGHT_ITEM_NATURES,
  formatNatureEffect,
  getBiomeMaterialTypes,
  getBossLootTables,
  getCrowniclesLocations,
  getEvents,
  getExpeditionLootTables,
  getItemLangStrings,
  getItemMaterialPools,
  getItems,
  getLocationNames,
  getMapLinks,
  getMapTypeNames,
  getMaterialCraftRecipes,
  getMaterialRarityNames,
  getMaterials,
  getRecipeNames,
  getUpgradeDistinctCounts,
  isMainItem,
  MAX_UPGRADE_LEVEL,
  poolDropChance,
  rarityDropChance,
  type CrowniclesEvent,
  type CrowniclesItem,
  type CrowniclesLocation,
  type CrowniclesMainItem,
  type CrowniclesMaterial,
  type CrowniclesSupportItem,
  type ItemCategory,
  type ItemLangStrings,
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
  /** Expedition terrain code (forest, cave, ...); the page resolves its icon/label. */
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

/** An item's attack/defense/speed at a given upgrade level. */
export interface EquipmentStats {
  readonly attack: number;
  readonly defense: number;
  readonly speed: number;
}

/** One material requirement of an upgrade level, resolved for display. */
export interface EquipmentUpgradeMaterial {
  readonly name: string;
  readonly icon: string | undefined;
  readonly quantity: number;
}

/** One upgrade step of a weapon or armor: its cost and the stats it yields. */
export interface EquipmentUpgradeLevel {
  readonly level: number;
  readonly stats: EquipmentStats;
  readonly materials: readonly EquipmentUpgradeMaterial[];
}

/** Display data of a weapon or armor. */
export interface EquipmentMainDetail {
  readonly kind: 'main';
  /** Stats before any upgrade (level `0`). */
  readonly stats: EquipmentStats;
  /** Coin value when sold. */
  readonly value: number;
  /** Upgrade path; empty when the item cannot be upgraded (basic rarity). */
  readonly upgrades: readonly EquipmentUpgradeLevel[];
}

/** Display data of a potion or object. */
export interface EquipmentSupportDetail {
  readonly kind: 'support';
  /** `ItemNature` id, so the page can prefix the effect with its emote. */
  readonly nature: number;
  /** Localized effect line, official game wording with the power substituted. */
  readonly effect: string;
  /** Coin value when sold; absent for potions (the game never pays for them). */
  readonly value?: number | undefined;
  /** Usage count, present for fight potions only. */
  readonly usages?: number | undefined;
}

/** One item of the equipment page, with everything its detail view shows. */
export interface EquipmentItem {
  readonly id: number;
  readonly name: string;
  readonly icon: string | undefined;
  readonly rarity: number;
  readonly detail: EquipmentMainDetail | EquipmentSupportDetail;
}

/** What the equipment page needs: items grouped for its pickers, plus names. */
export interface CrowniclesEquipmentData {
  /** Category -> rarity -> items sorted by name; empty-slot placeholders (id `0`) excluded. */
  readonly itemsByCategory: ReadonlyMap<
    ItemCategory,
    ReadonlyMap<number, readonly EquipmentItem[]>
  >;
  /** Official rarity names indexed by rarity (`0`..`8`). */
  readonly rarityNames: readonly string[];
}

/** Stats of a main item before any upgrade (the game's `getBaseAttack`-family). */
function baseStats(item: CrowniclesMainItem): EquipmentStats {
  const primary = computeBaseMainStat(
    item.rarity,
    item.raw,
    item.category === 'weapons' ? item.attack : item.defense,
  );
  return item.category === 'weapons'
    ? { attack: primary, defense: item.defense, speed: item.speed }
    : { attack: item.attack, defense: primary, speed: item.speed };
}

/** `base` scaled to an upgrade level, stat by stat. */
function statsAtLevel(base: EquipmentStats, level: number): EquipmentStats {
  return {
    attack: applyUpgradeLevel(base.attack, level),
    defense: applyUpgradeLevel(base.defense, level),
    speed: applyUpgradeLevel(base.speed, level),
  };
}

/** Composes a weapon/armor detail: level-0 stats, value and resolved upgrade path. */
function mainDetail(
  item: CrowniclesMainItem,
  materialById: ReadonlyMap<number, CrowniclesMaterial>,
  pools: Awaited<ReturnType<typeof getItemMaterialPools>>,
  distinctCounts: Awaited<ReturnType<typeof getUpgradeDistinctCounts>>,
): EquipmentMainDetail {
  const base = baseStats(item);
  const upgrades: EquipmentUpgradeLevel[] = [];
  for (let level = 1; level <= MAX_UPGRADE_LEVEL; level++) {
    const needs = computeUpgradeMaterials(item, level, pools, distinctCounts);
    if (needs.length === 0) continue;
    upgrades.push({
      level,
      stats: statsAtLevel(base, level),
      materials: needs.map((need) => {
        const material = materialById.get(need.materialId);
        return {
          name: material?.name ?? String(need.materialId),
          icon: material?.icon,
          quantity: need.quantity,
        };
      }),
    });
  }
  return {
    kind: 'main',
    stats: base,
    value: computeItemValue(item.rarity, item.raw),
    upgrades,
  };
}

/** Composes a potion/object detail: effect line, value (objects) and usages (fight potions). */
function supportDetail(
  item: CrowniclesSupportItem,
  lang: ItemLangStrings,
): EquipmentSupportDetail {
  const templates =
    item.category === 'potions' ? lang.potionNatures : lang.objectNatures;
  const isFightPotion =
    item.category === 'potions' &&
    FIGHT_ITEM_NATURES.includes(item.nature) &&
    item.power !== 0;
  return {
    kind: 'support',
    nature: item.nature,
    effect: formatNatureEffect(templates[item.nature] ?? '', item.power),
    ...(item.category === 'objects'
      ? { value: computeItemValue(item.rarity, item.power) }
      : {}),
    ...(isFightPotion ? { usages: item.usages } : {}),
  };
}

/** Composes the equipment page data for `locale` (fetches sit behind TTL caches). */
export async function loadEquipmentData(
  locale: SupportedLocale,
): Promise<CrowniclesEquipmentData> {
  const [items, lang, materials, pools, distinctCounts] = await Promise.all([
    getItems(locale),
    getItemLangStrings(locale),
    getMaterials(locale),
    getItemMaterialPools(),
    getUpgradeDistinctCounts(),
  ]);
  const materialById = new Map(
    materials.map((material) => [material.id, material]),
  );

  const itemsByCategory = new Map<ItemCategory, Map<number, EquipmentItem[]>>();
  const toEntry = (item: CrowniclesItem): EquipmentItem => ({
    id: item.id,
    name: item.name,
    icon: item.icon,
    rarity: item.rarity,
    detail: isMainItem(item)
      ? mainDetail(item, materialById, pools, distinctCounts)
      : supportDetail(item, lang),
  });

  for (const item of items) {
    // Id 0 of every category is the "no item equipped" placeholder.
    if (item.id === 0) continue;
    const byRarity =
      itemsByCategory.get(item.category) ?? new Map<number, EquipmentItem[]>();
    const list = byRarity.get(item.rarity) ?? [];
    list.push(toEntry(item));
    byRarity.set(item.rarity, list);
    itemsByCategory.set(item.category, byRarity);
  }
  for (const byRarity of itemsByCategory.values()) {
    for (const list of byRarity.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  return { itemsByCategory, rarityNames: lang.rarityNames };
}
