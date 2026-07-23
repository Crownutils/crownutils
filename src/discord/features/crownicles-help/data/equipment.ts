import {
  applyUpgradeLevel,
  computeBaseMainStat,
  computeItemValue,
  computeUpgradeMaterials,
  FIGHT_ITEM_NATURES,
  formatNatureEffect,
  getItemLangStrings,
  getItemMaterialPools,
  getItems,
  getMaterials,
  getUpgradeDistinctCounts,
  isMainItem,
  MAX_UPGRADE_LEVEL,
  type CrowniclesItem,
  type CrowniclesMainItem,
  type CrowniclesMaterial,
  type CrowniclesSupportItem,
  type ItemCategory,
  type ItemLangStrings,
} from '@/core/crownicles/index.js';
import type { SupportedLocale } from '@/core/types.js';

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
