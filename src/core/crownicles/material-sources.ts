import { cacheShared } from './cache.js';
import {
  fetchCrowniclesJson,
  fetchCrowniclesText,
  HTTP_CONCURRENCY,
  listCrowniclesDir,
  mapWithConcurrency,
} from './source.js';

/** Material ids that can drop, keyed by expedition terrain type (forest, cave, …). */
export type ExpeditionLootTables = Readonly<Record<string, readonly number[]>>;
/** Material ids that can drop, keyed by PVE boss map id. */
export type BossLootTables = ReadonlyMap<number, readonly number[]>;
/** Material types the `findMaterial` small event can yield, keyed by biome. */
export type BiomeMaterialTypes = Readonly<Record<string, readonly string[]>>;

/** A cooking recipe that crafts a material. */
export interface MaterialCraftRecipe {
  /** Recipe id (file name without extension), the key of its localized name. */
  readonly id: string;
  readonly outputMaterialId: number;
  /** Cooking level required to craft it. */
  readonly level: number;
  /** How many units one craft produces. */
  readonly quantity: number;
}

const EXPEDITION_CONSTANTS_PATH = 'Lib/src/constants/ExpeditionConstants.ts';
const PVE_CONSTANTS_PATH = 'Lib/src/constants/PVEConstants.ts';
const SMALL_EVENT_CONSTANTS_PATH = 'Lib/src/constants/SmallEventConstants.ts';
const RECIPES_DIR = 'Core/resources/cooking/recipes';

/** The brace-matched value object of a `NAME ... = { ... }` or `NAME: { ... }` constant. */
function extractConstBlock(source: string, name: string): string | undefined {
  const header = new RegExp(`${name}[^{]*\\{`).exec(source);
  if (!header) return undefined;

  const start = header.index + header[0].length - 1;
  let depth = 0;
  let end = start;
  for (; end < source.length; end++) {
    if (source[end] === '{') depth++;
    else if (source[end] === '}' && --depth === 0) break;
  }
  return source.slice(start, end + 1);
}

/** Reads `key: [ ids ]` entries from a loot-table block; `keyPattern` matches the key. */
function parseIdTable(
  block: string,
  keyPattern: string,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  const entry = new RegExp(`(${keyPattern})\\s*:\\s*\\[([^\\]]*)\\]`, 'g');
  for (const [, key, list] of block.matchAll(entry)) {
    if (key !== undefined && list !== undefined) {
      result[key] = (list.match(/\d+/g) ?? []).map(Number);
    }
  }
  return result;
}

/** Per-terrain expedition loot tables, parsed from the game constants and cached. */
export const getExpeditionLootTables = cacheShared(
  async (): Promise<ExpeditionLootTables> => {
    const source = await fetchCrowniclesText(EXPEDITION_CONSTANTS_PATH);
    const block = extractConstBlock(source, 'EXPEDITION_LOOT_TABLES');
    return block ? parseIdTable(block, '\\w+') : {};
  },
);

/** Per-boss (map id) loot tables, parsed from the game constants and cached. */
export const getBossLootTables = cacheShared(
  async (): Promise<BossLootTables> => {
    const source = await fetchCrowniclesText(PVE_CONSTANTS_PATH);
    const block = extractConstBlock(source, 'BOSS_LOOT_TABLES');
    const table = block ? parseIdTable(block, '\\d+') : {};
    return new Map(
      Object.entries(table).map(([mapId, ids]) => [Number(mapId), ids]),
    );
  },
);

/**
 * Which material types the `findMaterial` small event can yield in each biome,
 * parsed from `BIOME_MATERIAL_TYPES` (entries are `MaterialType.X` enum refs).
 */
export const getBiomeMaterialTypes = cacheShared(
  async (): Promise<BiomeMaterialTypes> => {
    const source = await fetchCrowniclesText(SMALL_EVENT_CONSTANTS_PATH);
    const block = extractConstBlock(source, 'BIOME_MATERIAL_TYPES');
    const result: Record<string, string[]> = {};
    if (block === undefined) return result;
    for (const [, biome, list] of block.matchAll(/(\w+)\s*:\s*\[([^\]]*)\]/g)) {
      if (biome === undefined || list === undefined) continue;
      const types = [...list.matchAll(/MaterialType\.(\w+)/g)].flatMap(
        ([, ref]) => (ref === undefined ? [] : [ref.toLowerCase()]),
      );
      if (types.length > 0) result[biome] = types;
    }
    return result;
  },
);

/** Raw shape of a `cooking/recipes/material_*.json` file, narrowed to what we read. */
interface RawCraftRecipe {
  readonly level?: number;
  readonly outputMaterialId?: number;
  readonly outputMaterialQuantity?: number;
}

/** Every cooking recipe that crafts a material, fetched once and cached. */
export const getMaterialCraftRecipes = cacheShared(
  async (): Promise<readonly MaterialCraftRecipe[]> => {
    const files = (await listCrowniclesDir(RECIPES_DIR)).filter((name) =>
      name.startsWith('material_'),
    );
    const recipes = await mapWithConcurrency(
      files,
      HTTP_CONCURRENCY,
      async (file) => ({
        file,
        recipe: await fetchCrowniclesJson<RawCraftRecipe>(
          `${RECIPES_DIR}/${file}`,
        ),
      }),
    );
    return recipes.flatMap(({ file, recipe }) =>
      recipe.outputMaterialId === undefined
        ? []
        : [
            {
              id: file.replace(/\.json$/, ''),
              outputMaterialId: recipe.outputMaterialId,
              level: recipe.level ?? 0,
              quantity: recipe.outputMaterialQuantity ?? 1,
            },
          ],
    );
  },
);
