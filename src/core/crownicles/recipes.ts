import { cacheShared } from './cache.js';
import {
  fetchCrowniclesJson,
  fetchCrowniclesText,
  HTTP_CONCURRENCY,
  listCrowniclesDir,
  mapWithConcurrency,
  parseIconNameBlock,
} from './source.js';

/** The three families a cooking recipe can produce, in display order. */
export const RECIPE_OUTPUT_TYPES = ['material', 'potion', 'petFood'] as const;

/** One of the {@link RECIPE_OUTPUT_TYPES}; the discriminant of {@link CrowniclesRecipe}. */
export type RecipeOutputType = (typeof RECIPE_OUTPUT_TYPES)[number];

/** A plant a recipe consumes, by plant id (see {@link getPlants}). */
export interface RecipePlantCost {
  readonly plantId: number;
  readonly quantity: number;
}

/** A material a recipe consumes, by material id (see {@link getMaterials}). */
export interface RecipeMaterialCost {
  readonly materialId: number;
  readonly quantity: number;
}

/** The pet food a `petFood` recipe produces. */
export interface RecipePetFood {
  /** Food kind (`commonFood`, `carnivorousFood`, ...), the key of its name and emote. */
  readonly type: string;
  readonly quantity: number;
  /** Love points the food grants the pet it is fed to. */
  readonly lovePoints: number;
}

/** The fields every cooking recipe carries, whatever it produces. */
interface RecipeBase {
  /** Recipe id (file name without extension), the key of its localized name. */
  readonly id: string;
  /** The game's `RecipeType`, the key of its family emote (e.g. `POTION_HEALTH`). */
  readonly recipeType: string;
  /**
   * Recipe difficulty, `1`..`8`. Not a gate: the game weighs it against the
   * cook's grade to set the failure rate (see {@link CookingRules}), and only
   * the `COOKING_LEVEL` discovery compares it to a cooking level directly.
   */
  readonly level: number;
  readonly plants: readonly RecipePlantCost[];
  readonly materials: readonly RecipeMaterialCost[];
  /** True when every player knows the recipe from the start. */
  readonly discoveredByDefault: boolean;
  /**
   * How the recipe is learnt when it is not known by default (`WITCH`,
   * `FARMER`, `GASPARD_JO`, `ISLAND_BOSS`, `COOKING_LEVEL`,
   * `PLAYER_LEVEL_MILESTONE`, `CAMPAIGN_MILESTONE`); `undefined` otherwise.
   */
  readonly discoverySource: string | undefined;
}

/** A recipe crafting a material. */
export interface MaterialRecipe extends RecipeBase {
  readonly outputType: 'material';
  readonly outputMaterialId: number;
  /** How many units one craft produces. */
  readonly outputMaterialQuantity: number;
}

/**
 * A recipe brewing a potion. It names no item id: the game draws one potion at
 * random among those sharing this nature and rarity.
 */
export interface PotionRecipe extends RecipeBase {
  readonly outputType: 'potion';
  /** `ItemNature` id of the brewed potion. */
  readonly potionNature: number;
  /** Item rarity of the brewed potion. */
  readonly potionRarity: number;
}

/** A recipe cooking pet food. */
export interface PetFoodRecipe extends RecipeBase {
  readonly outputType: 'petFood';
  readonly petFood: RecipePetFood;
}

/** Any cooking recipe; narrow it on `outputType`. */
export type CrowniclesRecipe = MaterialRecipe | PotionRecipe | PetFoodRecipe;

const RECIPES_DIR = 'Core/resources/cooking/recipes';
const ICONS_SOURCE_PATH = 'Lib/src/CrowniclesIcons.ts';
const COOKING_CONSTANTS_PATH = 'Lib/src/constants/CookingConstants.ts';
const PLANT_CONSTANTS_PATH = 'Lib/src/constants/PlantConstants.ts';

/** What each successive recipe bought from one merchant costs, in coins. */
export interface RecipeShopCosts {
  readonly farmer: readonly number[];
  readonly gaspardJo: readonly number[];
}

/**
 * One cooking grade: the title a cooking level falls into. A recipe is never
 * locked behind a grade -- cooking one above `maxRecipeLevelWithoutPenalty`
 * merely raises the failure rate, by
 * {@link CookingRules.failureRatePerExtraLevel} per level of overshoot.
 */
export interface CookingGrade {
  /** Grade id, the key of its localized title in `models.json`. */
  readonly id: string;
  /** Lowest cooking level that reaches this grade. */
  readonly minLevel: number;
  /** Highest cooking level of this grade; `undefined` for the open-ended top grade. */
  readonly maxLevel: number | undefined;
  /** Base failure rate (`0..1`) of this grade, before any difficulty penalty. */
  readonly failureRate: number;
  /** Highest recipe level this grade cooks without an added failure rate. */
  readonly maxRecipeLevelWithoutPenalty: number;
}

/** The cooking balance rules the help center explains. */
export interface CookingRules {
  /** Grades in ascending cooking level. */
  readonly grades: readonly CookingGrade[];
  /** Failure rate added per recipe level above the grade's clean ceiling. */
  readonly failureRatePerExtraLevel: number;
  /** Cooking experience each plant is worth, keyed by plant id. */
  readonly plantXp: Readonly<Record<number, number>>;
  /** Cooking experience each material is worth, keyed by rarity (`1`..`3`). */
  readonly materialRarityXp: Readonly<Record<number, number>>;
  /** Share of the plant experience a successful craft keeps (`0..1`). */
  readonly plantWeight: number;
  /** Share of the material experience a successful craft keeps (`0..1`). */
  readonly materialWeight: number;
  /** Experience a botched craft grants per level of recipe difficulty. */
  readonly failureXpPerLevel: number;
  /** Overshoot above the grade's ceiling from which a craft grants nothing. */
  readonly noXpLevelThreshold: number;
}

/** Raw shape of a `cooking/recipes/<id>.json` file, narrowed to what we read. */
interface RawRecipe {
  readonly level?: number;
  readonly recipeType?: string;
  readonly plants?: readonly RecipePlantCost[];
  readonly materials?: readonly RecipeMaterialCost[];
  readonly outputType?: string;
  readonly potionNature?: number;
  readonly potionRarity?: number;
  readonly petFood?: RecipePetFood | null;
  readonly outputMaterialId?: number;
  readonly outputMaterialQuantity?: number;
  readonly discoveredByDefault?: boolean;
  readonly discoverySource?: string | null;
}

/**
 * Narrows one raw recipe to its union member, or `undefined` when the file
 * lacks the output its own `outputType` announces (so a malformed or
 * newly-shaped entry is skipped rather than rendered half-empty).
 */
function toRecipe(id: string, raw: RawRecipe): CrowniclesRecipe | undefined {
  const base = {
    id,
    recipeType: raw.recipeType ?? '',
    level: raw.level ?? 0,
    plants: raw.plants ?? [],
    materials: raw.materials ?? [],
    discoveredByDefault: raw.discoveredByDefault ?? false,
    discoverySource: raw.discoverySource ?? undefined,
  } satisfies RecipeBase;

  switch (raw.outputType) {
    case 'material':
      return raw.outputMaterialId === undefined
        ? undefined
        : {
            ...base,
            outputType: 'material',
            outputMaterialId: raw.outputMaterialId,
            outputMaterialQuantity: raw.outputMaterialQuantity ?? 1,
          };
    case 'potion':
      return raw.potionNature === undefined || raw.potionRarity === undefined
        ? undefined
        : {
            ...base,
            outputType: 'potion',
            potionNature: raw.potionNature,
            potionRarity: raw.potionRarity,
          };
    case 'petFood':
      return raw.petFood
        ? { ...base, outputType: 'petFood', petFood: raw.petFood }
        : undefined;
    default:
      return undefined;
  }
}

/**
 * Every cooking recipe of the game -- all three output families -- fetched once
 * and cached. One directory listing plus one file per recipe, so every reader
 * (the recipes page, the materials page's craft lookup) shares a single load.
 */
export const getCookingRecipes = cacheShared(
  async (): Promise<readonly CrowniclesRecipe[]> => {
    const files = (await listCrowniclesDir(RECIPES_DIR)).filter((name) =>
      name.endsWith('.json'),
    );
    const entries = await mapWithConcurrency(
      files,
      HTTP_CONCURRENCY,
      async (file) => ({
        id: file.replace(/\.json$/, ''),
        raw: await fetchCrowniclesJson<RawRecipe>(`${RECIPES_DIR}/${file}`),
      }),
    );
    return entries.flatMap(({ id, raw }) => {
      const recipe = toRecipe(id, raw);
      return recipe ? [recipe] : [];
    });
  },
);

/** Recipe-family emotes keyed by `recipeType`, from the game's icon source. */
export const getRecipeTypeIcons = cacheShared(async () =>
  parseIconNameBlock(
    await fetchCrowniclesText(ICONS_SOURCE_PATH),
    'cookingRecipeTypes',
  ),
);

/** Pet-food emotes keyed by food kind (`commonFood`, ...), from the game's icon source. */
export const getFoodIcons = cacheShared(async () =>
  parseIconNameBlock(await fetchCrowniclesText(ICONS_SOURCE_PATH), 'foods'),
);

/**
 * Every reader below fails loudly rather than falling back to a zero. These
 * constants are read out of the game's TypeScript source with regular
 * expressions, so an upstream rewrite can stop a pattern from matching; a
 * silent `0` would then reach the page as a confident "0 %" or "0 XP", while
 * a thrown error surfaces as the help center's ordinary load-error view.
 */
function missingConstant(name: string): Error {
  return new Error(`Crownicles constant unreadable: ${name}`);
}

/** Reads the numbers of a `NAME = [ ... ]` array constant; never empty. */
function requireNumberArrayConst(source: string, name: string): number[] {
  const match = new RegExp(`${name}\\s*=\\s*\\[([^\\]]*)\\]`).exec(source);
  const values = (match?.[1]?.match(/\d+/g) ?? []).map(Number);
  if (values.length === 0) throw missingConstant(name);
  return values;
}

/** Reads a `<name><separator> <number>` pair; `undefined` when absent. */
function parseNumber(
  source: string,
  name: string,
  separator: string,
): number | undefined {
  const match = new RegExp(
    `${name}\\s*${separator}\\s*(\\d+(?:\\.\\d+)?)`,
  ).exec(source);
  return match?.[1] === undefined ? undefined : Number(match[1]);
}

/** {@link parseNumber}, throwing when the constant no longer matches. */
function requireNumber(
  source: string,
  name: string,
  separator: string,
): number {
  const value = parseNumber(source, name, separator);
  if (value === undefined) throw missingConstant(name);
  return value;
}

/**
 * A rate the game stores as a `0..1` fraction. The range check is what catches
 * a rewrite the pattern still matches but reads wrong -- `= 15 / 100` would
 * otherwise yield `15`, and the page would announce a 1500 % penalty.
 */
function requireRate(source: string, name: string, separator: string): number {
  const value = requireNumber(source, name, separator);
  if (value < 0 || value > 1) {
    throw new Error(
      `Crownicles constant out of the 0..1 range: ${name}=${value}`,
    );
  }
  return value;
}

/**
 * Reads an `[<Enum>.<NAME>]: <number>` table into a record keyed by the enum's
 * numeric value, resolved through `enumValues`. Entries whose member is unknown
 * are dropped rather than guessed at.
 */
function parseEnumKeyedTable(
  source: string,
  name: string,
  enumValues: Readonly<Record<string, number>>,
): Record<number, number> {
  const block = new RegExp(`${name}[^{]*\\{([^}]*)\\}`).exec(source);
  const table: Record<number, number> = {};
  for (const [, member, value] of (block?.[1] ?? '').matchAll(
    /\[\w+\.(\w+)\]:\s*(\d+(?:\.\d+)?)/g,
  )) {
    const id = member === undefined ? undefined : enumValues[member];
    if (id !== undefined && value !== undefined) table[id] = Number(value);
  }
  return table;
}

/** Reads a `NAME = <n>,` member table of a TypeScript enum declaration. */
function parseEnumValues(source: string, name: string): Record<string, number> {
  const block = new RegExp(`enum\\s+${name}\\s*\\{([^}]*)\\}`).exec(source);
  const values: Record<string, number> = {};
  for (const [, member, value] of (block?.[1] ?? '').matchAll(
    /(\w+)\s*=\s*(\d+)/g,
  )) {
    if (member !== undefined && value !== undefined) {
      values[member] = Number(value);
    }
  }
  return values;
}

/**
 * `MaterialRarity`, whose three members the game keys its material experience
 * table by. Tiny and stable, so it is kept here rather than fetched -- plain
 * numeric data, as with the other balance constants (see the project NOTICE).
 */
const MATERIAL_RARITY_VALUES = { COMMON: 1, UNCOMMON: 2, RARE: 3 } as const;

/**
 * Reads the `COOKING_GRADES` array. Each grade is a flat object literal, so the
 * entries are matched one `{ ... }` at a time; an entry that gained a nested
 * object would be skipped, which {@link requireContiguousLadder} then catches.
 */
function parseGrades(source: string): CookingGrade[] {
  const block = /COOKING_GRADES[^[]*\[([\s\S]*?)\n\] as const;/.exec(source);
  const grades: CookingGrade[] = [];
  for (const [entry] of (block?.[1] ?? '').matchAll(/\{[^{}]*\}/g)) {
    const id = /id:\s*["']([^"']+)["']/.exec(entry)?.[1];
    const minLevel = parseNumber(entry, 'minLevel', ':');
    const failureRate = parseNumber(entry, 'failureRate', ':');
    const clean = parseNumber(entry, 'maxRecipeLevelWithoutPenalty', ':');
    if (
      id !== undefined &&
      minLevel !== undefined &&
      failureRate !== undefined &&
      clean !== undefined
    ) {
      grades.push({
        id,
        minLevel,
        // The top grade caps at `Infinity`, which reads back as no ceiling.
        maxLevel: parseNumber(entry, 'maxLevel', ':'),
        failureRate,
        maxRecipeLevelWithoutPenalty: clean,
      });
    }
  }
  return grades.sort((a, b) => a.minLevel - b.minLevel);
}

/**
 * The ladder covers every cooking level without a hole, so a gap between two
 * grades means an entry in between failed to parse -- the one failure mode a
 * per-entry match cannot notice on its own.
 */
function requireContiguousLadder(grades: readonly CookingGrade[]): void {
  if (grades.length === 0) throw missingConstant('COOKING_GRADES');
  for (const [index, grade] of grades.entries()) {
    const previous = grades[index - 1];
    if (previous === undefined) continue;
    if (
      previous.maxLevel === undefined ||
      grade.minLevel !== previous.maxLevel + 1
    ) {
      throw new Error(
        `Crownicles COOKING_GRADES ladder has a gap before "${grade.id}"`,
      );
    }
  }
}

/** Reads an experience table, throwing when it comes back empty. */
function requireTable(
  table: Record<number, number>,
  name: string,
): Record<number, number> {
  if (Object.keys(table).length === 0) throw missingConstant(name);
  return table;
}

/**
 * The cooking grade ladder, the overshoot penalty and the experience tables,
 * parsed from the game constants. Every value is required: the page would
 * rather show its load error than a table of zeros (see {@link missingConstant}).
 */
export const getCookingRules = cacheShared(async (): Promise<CookingRules> => {
  const [source, plantSource] = await Promise.all([
    fetchCrowniclesText(COOKING_CONSTANTS_PATH),
    fetchCrowniclesText(PLANT_CONSTANTS_PATH),
  ]);

  const grades = parseGrades(source);
  requireContiguousLadder(grades);

  return {
    grades,
    failureRatePerExtraLevel: requireRate(
      source,
      'FAILURE_RATE_PER_EXTRA_LEVEL',
      '=',
    ),
    plantXp: requireTable(
      parseEnumKeyedTable(
        source,
        'PLANT_COOKING_XP',
        parseEnumValues(plantSource, 'PlantId'),
      ),
      'PLANT_COOKING_XP',
    ),
    materialRarityXp: requireTable(
      parseEnumKeyedTable(
        source,
        'MATERIAL_RARITY_COOKING_XP',
        MATERIAL_RARITY_VALUES,
      ),
      'MATERIAL_RARITY_COOKING_XP',
    ),
    plantWeight: requireRate(source, 'PLANT_WEIGHT', ':'),
    materialWeight: requireRate(source, 'MATERIAL_WEIGHT', ':'),
    failureXpPerLevel: requireNumber(source, 'FAILURE_XP_PER_LEVEL', ':'),
    noXpLevelThreshold: requireNumber(source, 'NO_XP_LEVEL_THRESHOLD', '='),
  };
});

/**
 * The merchants' recipe price ladders, parsed from the game constants. The game
 * charges by how many recipes the player already bought from that merchant, not
 * by which recipe it is, so these are positional prices.
 */
export const getRecipeShopCosts = cacheShared(
  async (): Promise<RecipeShopCosts> => {
    const source = await fetchCrowniclesText(COOKING_CONSTANTS_PATH);
    return {
      farmer: requireNumberArrayConst(source, 'FARMER_RECIPE_COSTS'),
      gaspardJo: requireNumberArrayConst(source, 'GASPARD_JO_RECIPE_COSTS'),
    };
  },
);
