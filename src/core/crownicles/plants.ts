import type { SupportedLocale } from '@/core/types.js';
import { cachePerLocale, cacheShared } from './cache.js';
import { getPlantNames } from './models.js';
import { fetchCrowniclesText, parseIconIdBlock } from './source.js';

/** One cooking plant, merging its localized name with its emote. */
export interface CrowniclesPlant {
  readonly id: number;
  readonly name: string;
  /** Unicode emote of the plant, or `undefined` if the source has none. */
  readonly icon: string | undefined;
  /**
   * Material ids composting this plant can yield. The game picks one of them
   * uniformly per composted plant, so each is equally likely.
   */
  readonly compostMaterials: readonly number[];
}

const ICONS_SOURCE_PATH = 'Lib/src/CrowniclesIcons.ts';
const PLANT_CONSTANTS_PATH = 'Lib/src/constants/PlantConstants.ts';

/** Plant emotes by id string, parsed from the game's icon source and cached. */
const getPlantIcons = cacheShared(async () =>
  parseIconIdBlock(await fetchCrowniclesText(ICONS_SOURCE_PATH), 'plants'),
);

/** Drops `//` comments, whose wording would otherwise feed the id scans below. */
function stripLineComments(source: string): string {
  return source.replace(/\/\/[^\n]*/g, '');
}

/** Numeric plant ids by `PlantId` member name, read from the enum declaration. */
function parsePlantIdEnum(source: string): Record<string, number> {
  const block = /enum\s+PlantId\s*\{([^}]*)\}/.exec(source);
  const ids: Record<string, number> = {};
  if (!block?.[1]) return ids;
  for (const [, member, value] of block[1].matchAll(/(\w+)\s*=\s*(\d+)/g)) {
    if (member !== undefined && value !== undefined)
      ids[member] = Number(value);
  }
  return ids;
}

/**
 * Compost pools by plant id, parsed from the `PLANT_TYPES` table: each entry
 * pairs an `id: PlantId.<member>` with the `compostMaterials` list that follows
 * it. Empty when the source no longer matches.
 */
const getPlantCompostPools = cacheShared(
  async (): Promise<ReadonlyMap<number, readonly number[]>> => {
    const source = stripLineComments(
      await fetchCrowniclesText(PLANT_CONSTANTS_PATH),
    );
    const idsByMember = parsePlantIdEnum(source);
    const pools = new Map<number, readonly number[]>();
    const entry =
      /id:\s*PlantId\.(\w+)[\s\S]*?compostMaterials:\s*\[([^\]]*)\]/g;
    for (const [, member, list] of source.matchAll(entry)) {
      const id = member === undefined ? undefined : idsByMember[member];
      if (id === undefined || list === undefined) continue;
      pools.set(id, (list.match(/\d+/g) ?? []).map(Number));
    }
    return pools;
  },
);
/**
 * Every cooking plant for `locale`, cached per locale. Plants have no resource
 * directory of their own, so the id set is the one `models.json` names -- also
 * the only place their wording lives.
 */
export const getPlants = cachePerLocale(
  async (locale: SupportedLocale): Promise<readonly CrowniclesPlant[]> => {
    const [names, icons, compostPools] = await Promise.all([
      getPlantNames(locale),
      getPlantIcons(),
      getPlantCompostPools(),
    ]);
    return Object.entries(names)
      .map(([id, name]) => ({
        id: Number(id),
        name,
        icon: icons[id],
        compostMaterials: compostPools.get(Number(id)) ?? [],
      }))
      .filter((plant) => Number.isInteger(plant.id))
      .sort((a, b) => a.id - b.id);
  },
);
