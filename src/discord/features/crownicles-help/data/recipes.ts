import {
  getCookingGradeNames,
  getCookingRecipes,
  getCookingRules,
  getFoodIcons,
  getFoodNames,
  getItemLangStrings,
  getItems,
  getMaterialRarityNames,
  getMaterials,
  getPlants,
  getRecipeNames,
  getRecipeShopCosts,
  getRecipeTypeIcons,
  isMainItem,
  RECIPE_OUTPUT_TYPES,
  type CookingGrade,
  type CookingRules,
  type CrowniclesPlant,
  type CrowniclesRecipe,
  type CrowniclesSupportItem,
  type RecipeOutputType,
  type RecipeShopCosts,
} from '@/core/crownicles/index.js';
import type { SupportedLocale } from '@/core/types.js';
import { natureEffectLine } from '../format.js';

/** One ingredient line of a recipe: what it costs and how much of it. */
export interface RecipeIngredient {
  readonly name: string;
  readonly icon: string | undefined;
  readonly quantity: number;
}

/** A potion a `potion` recipe can yield; the game draws one of them at random. */
export interface RecipePotionCandidate {
  readonly name: string;
  readonly icon: string | undefined;
  /** `ItemNature` id, so the page can front the effect with that nature's emote. */
  readonly nature: number;
  /** Localized effect line, official game wording with the power substituted. */
  readonly effect: string;
}

/** What a recipe produces, discriminated like the recipe itself. */
export type RecipeOutput =
  | {
      readonly kind: 'material';
      readonly name: string;
      readonly icon: string | undefined;
      readonly quantity: number;
    }
  | {
      readonly kind: 'potion';
      /** Item rarity of the brewed potion, so the picker can show its emote. */
      readonly rarity: number;
      readonly rarityName: string;
      /** Every potion of that nature and rarity, one of which the craft yields. */
      readonly candidates: readonly RecipePotionCandidate[];
    }
  | {
      readonly kind: 'petFood';
      /** Official food name, already in the plural form matching `quantity`. */
      readonly name: string;
      readonly icon: string | undefined;
      readonly quantity: number;
      readonly lovePoints: number;
    };

/** The first cooking grade that takes no difficulty penalty, resolved for display. */
export interface RecipeGrade {
  /** Official grade title (e.g. `Marmiton`). */
  readonly name: string;
  /** Cooking level that reaches this grade. */
  readonly minCookingLevel: number;
  /** Odds of botching the craft at this grade (`0..1`). */
  readonly failureRate: number;
  /** Odds at the lowest grade of all; equal to {@link failureRate} when that is this one. */
  readonly worstFailureRate: number;
  /**
   * Odds at the top grade, the real floor. Never equal to {@link failureRate}
   * except at the top grade itself: reaching the penalty-free grade removes the
   * difficulty penalty, but every grade above still lowers its own base rate.
   */
  readonly bestFailureRate: number;
}

/** One recipe of the recipes page, with everything its detail view shows. */
export interface HelpRecipe {
  readonly id: string;
  /** Official recipe name. */
  readonly name: string;
  /** The game's `RecipeType`; the family recipes are grouped by within a category. */
  readonly recipeType: string;
  /** Recipe-family emote, from the game's `cookingRecipeTypes` table. */
  readonly icon: string | undefined;
  /** Recipe difficulty (`1`..`8`), weighed against the cook's grade. */
  readonly level: number;
  /** Grade cooking it without an added failure risk; absent if none reaches it. */
  readonly grade: RecipeGrade | undefined;
  /** How the recipe is learnt; `undefined` when known from the start. */
  readonly discoverySource: string | undefined;
  /** Where it falls in its source's order; absent when the source has none. */
  readonly discoveryPosition: DiscoveryPosition | undefined;
  readonly plants: readonly RecipeIngredient[];
  readonly materials: readonly RecipeIngredient[];
  readonly output: RecipeOutput;
}

/** One cooking grade, resolved for the rules section. */
export interface GuideGrade {
  /** Official grade title. */
  readonly name: string;
  readonly minCookingLevel: number;
  /** Highest cooking level of the grade; absent for the open-ended top one. */
  readonly maxCookingLevel: number | undefined;
  /** Odds of botching a craft this grade handles cleanly (`0..1`). */
  readonly failureRate: number;
  /** Hardest difficulty it cooks without an added failure risk. */
  readonly maxCleanDifficulty: number;
}

/** One plant and the cooking experience it is worth. */
export interface GuideXpEntry {
  readonly name: string;
  readonly icon: string | undefined;
  readonly xp: number;
}

/** One material rarity and the cooking experience a unit of it is worth. */
export interface GuideRarityXp {
  /** Rarity level (`1`..`3`), so the page picks the emote it already owns. */
  readonly rarity: number;
  readonly name: string;
  readonly xp: number;
}

/**
 * A worked example of the failure formula, computed from the same tables the
 * section prints, so it cannot drift from them the way a hand-written one does.
 */
export interface GuideFailureExample {
  /** Official title of the grade the example cooks at. */
  readonly gradeName: string;
  /** Hardest difficulty that grade handles without a penalty. */
  readonly maxCleanDifficulty: number;
  /** Difficulty attempted; always above {@link maxCleanDifficulty}. */
  readonly difficulty: number;
  /** The grade's own rate, before the penalty (`0..1`). */
  readonly baseFailureRate: number;
  /** Levels of overshoot, each costing the per-level penalty. */
  readonly extraLevels: number;
  /** Resulting rate (`0..1`), capped like the game caps it. */
  readonly totalFailureRate: number;
}

/** Everything the two rules sections explain, resolved and localized. */
export interface CookingGuide {
  readonly grades: readonly GuideGrade[];
  /** Plants in ascending experience. */
  readonly plants: readonly GuideXpEntry[];
  /** Material rarities in ascending experience. */
  readonly materialRarities: readonly GuideRarityXp[];
  /** Share of the plant experience a successful craft keeps (`0..1`). */
  readonly plantWeight: number;
  /** Share of the material experience a successful craft keeps (`0..1`). */
  readonly materialWeight: number;
  /** Experience a botched craft grants per level of difficulty. */
  readonly failureXpPerLevel: number;
  /** Overshoot above the grade's ceiling from which a craft grants nothing. */
  readonly noXpLevelThreshold: number;
  /** Failure rate added per difficulty level above that ceiling. */
  readonly failureRatePerExtraLevel: number;
  /** Worked example of the formula; absent if no grade ever overshoots. */
  readonly failureExample: GuideFailureExample | undefined;
}

/**
 * Everything the recipes page renders: the recipes grouped for its pickers and
 * indexed for its detail view, the shop price ladders, and the balance rules
 * its two other sections explain.
 */
export interface CrowniclesRecipesData {
  /**
   * Output category -> recipe family (`RecipeType`) -> recipes sorted by level.
   * Grouping by family mirrors the page's middle picker, so the eight tiers of
   * a potion read as one ladder instead of being interleaved with other families.
   */
  readonly recipesByCategory: ReadonlyMap<
    RecipeOutputType,
    ReadonlyMap<string, readonly HelpRecipe[]>
  >;
  /** Every recipe by id, so the detail view resolves a selection in one lookup. */
  readonly recipesById: ReadonlyMap<string, HelpRecipe>;
  /** Price ladders of the two merchants that sell recipes. */
  readonly shopCosts: RecipeShopCosts;
  /** Hardest difficulty in the game, so a recipe's own reads as `7 of 8`. */
  readonly maxRecipeLevel: number;
  /** The balance rules the experience and failure sections spell out. */
  readonly cooking: CookingGuide;
}

/**
 * Builds the worked example: a mid-ladder grade among those that still take a
 * penalty on the hardest recipe in the game, so the example always shows a
 * real overshoot. `undefined` when every grade handles everything cleanly.
 */
function toFailureExample(
  rules: CookingRules,
  gradeNames: Record<string, string>,
  maxRecipeLevel: number,
): GuideFailureExample | undefined {
  const overshooting = rules.grades.filter(
    (grade) => grade.maxRecipeLevelWithoutPenalty < maxRecipeLevel,
  );
  const grade = overshooting[Math.floor((overshooting.length - 1) / 2)];
  if (grade === undefined) return undefined;
  return {
    gradeName: gradeNames[grade.id] ?? grade.id,
    maxCleanDifficulty: grade.maxRecipeLevelWithoutPenalty,
    difficulty: maxRecipeLevel,
    baseFailureRate: grade.failureRate,
    extraLevels: maxRecipeLevel - grade.maxRecipeLevelWithoutPenalty,
    totalFailureRate: failureRateAt(grade, maxRecipeLevel, rules),
  };
}

/** Composes the two rules sections from the game's balance tables. */
function toCookingGuide(
  rules: CookingRules,
  gradeNames: Record<string, string>,
  plants: readonly CrowniclesPlant[],
  rarityNames: Record<string, string>,
  maxRecipeLevel: number,
): CookingGuide {
  return {
    grades: rules.grades.map((grade) => ({
      name: gradeNames[grade.id] ?? grade.id,
      minCookingLevel: grade.minLevel,
      maxCookingLevel: grade.maxLevel,
      failureRate: grade.failureRate,
      maxCleanDifficulty: grade.maxRecipeLevelWithoutPenalty,
    })),
    plants: plants
      .map((plant) => ({
        name: plant.name,
        icon: plant.icon,
        xp: rules.plantXp[plant.id] ?? 0,
      }))
      .sort((a, b) => a.xp - b.xp),
    materialRarities: Object.entries(rules.materialRarityXp)
      .map(([rarity, xp]) => ({
        rarity: Number(rarity),
        name: rarityNames[rarity] ?? rarity,
        xp,
      }))
      .sort((a, b) => a.xp - b.xp),
    plantWeight: rules.plantWeight,
    materialWeight: rules.materialWeight,
    failureXpPerLevel: rules.failureXpPerLevel,
    noXpLevelThreshold: rules.noXpLevelThreshold,
    failureRatePerExtraLevel: rules.failureRatePerExtraLevel,
    failureExample: toFailureExample(rules, gradeNames, maxRecipeLevel),
  };
}

/**
 * The game's `getFailureRate`: a grade's floor, plus the overshoot penalty,
 * capped at certainty the way the game caps it when rolling the craft.
 */
function failureRateAt(
  grade: CookingGrade,
  level: number,
  rules: CookingRules,
): number {
  const overshoot = Math.max(0, level - grade.maxRecipeLevelWithoutPenalty);
  return Math.min(
    grade.failureRate + rules.failureRatePerExtraLevel * overshoot,
    1,
  );
}

/**
 * The lowest grade that cooks `level` without an added failure risk, carrying
 * the odds there, at the opening grade and at the top one -- the anchors that
 * turn an abstract difficulty into something a player can act on. Absent when
 * no grade reaches the level, which the balance table never does today.
 */
function gradeFor(
  level: number,
  rules: CookingRules,
  names: Record<string, string>,
): RecipeGrade | undefined {
  const grade = rules.grades.find(
    (entry: CookingGrade) => entry.maxRecipeLevelWithoutPenalty >= level,
  );
  const worst = rules.grades[0];
  const best = rules.grades[rules.grades.length - 1];
  if (grade === undefined || worst === undefined || best === undefined) {
    return undefined;
  }
  return {
    name: names[grade.id] ?? grade.id,
    minCookingLevel: grade.minLevel,
    failureRate: failureRateAt(grade, level, rules),
    worstFailureRate: failureRateAt(worst, level, rules),
    bestFailureRate: failureRateAt(best, level, rules),
  };
}

/**
 * Sources that do not hand their recipes over in a rankable order: the witch
 * picks by the nature of the potion she gives, and the cooking level grants
 * every recipe at or below it in one go.
 */
const UNORDERED_SOURCES = new Set(['WITCH', 'COOKING_LEVEL']);

/**
 * Slots a recipe can occupy in its source's hand-out order, `1`-based and
 * inclusive. A slot is a concrete milestone: the player level reached, the
 * campaign mission completed, the distinct final boss beaten, or the purchase
 * made from that merchant. `to` is the slot by which the recipe is certainly
 * known; `from === to` when that slot is exact rather than an upper bound.
 */
export interface DiscoveryPosition {
  readonly from: number;
  readonly to: number;
}

/**
 * Where each recipe falls in its source's order, for the sources that hand
 * their recipes over one at a time. Every such source grants one recipe per
 * milestone -- one per level gained, per campaign mission completed, per
 * distinct final boss beaten, per purchase -- so a slot number reads directly
 * as that milestone. Player levels line up exactly, the game starting players
 * at level `0` and granting on each level-up.
 *
 * The game sorts a source's recipes by ascending level with a stable sort, so
 * recipes of a lower level always come first -- but the order *within* one
 * level is whatever the game's own `readdirSync` returned, which no
 * specification pins down. A bound is therefore computed rather than a guess:
 * the recipe sits after every strictly easier one and no later than the last of
 * its own difficulty, whatever the tie order. The page reads `to` from that,
 * which is true under every ordering.
 */
function discoveryPositions(
  recipes: readonly CrowniclesRecipe[],
): ReadonlyMap<string, DiscoveryPosition> {
  const bySource = new Map<string, CrowniclesRecipe[]>();
  for (const recipe of recipes) {
    const source = recipe.discoveredByDefault
      ? undefined
      : recipe.discoverySource;
    if (source === undefined || UNORDERED_SOURCES.has(source)) continue;
    const list = bySource.get(source) ?? [];
    list.push(recipe);
    bySource.set(source, list);
  }

  const positions = new Map<string, DiscoveryPosition>();
  for (const list of bySource.values()) {
    for (const recipe of list) {
      const easier = list.filter((other) => other.level < recipe.level).length;
      const upTo = list.filter((other) => other.level <= recipe.level).length;
      positions.set(recipe.id, { from: easier + 1, to: upTo });
    }
  }
  return positions;
}

/** Anything resolvable to an ingredient line: a named, optionally emoted entry. */
interface NamedEntry {
  readonly name: string;
  readonly icon: string | undefined;
}

/** Resolves an ingredient cost against its entry table, falling back to the raw id. */
function toIngredient(
  id: number,
  quantity: number,
  byId: ReadonlyMap<number, NamedEntry>,
): RecipeIngredient {
  const entry = byId.get(id);
  return { name: entry?.name ?? String(id), icon: entry?.icon, quantity };
}

/**
 * Official pet-food name in the form matching `quantity`, falling back to the
 * capitalized singular then to the raw food kind.
 */
function foodName(
  names: Record<string, string>,
  type: string,
  quantity: number,
): string {
  const plural = quantity === 1 ? names[`${type}_one`] : names[`${type}_other`];
  return plural ?? names[`${type}_capitalized`] ?? type;
}

/** Everything the output resolvers share, gathered once per load. */
interface OutputContext {
  readonly locale: SupportedLocale;
  readonly materialById: ReadonlyMap<number, NamedEntry>;
  /** Potions keyed `<nature>:<rarity>`, the pair a potion recipe names. */
  readonly potionsByEffect: ReadonlyMap<
    string,
    readonly CrowniclesSupportItem[]
  >;
  readonly rarityNames: readonly string[];
  readonly potionNatures: readonly string[];
  readonly foodNames: Record<string, string>;
  readonly foodIcons: Record<string, string>;
}

/** Resolves what one craft of `recipe` hands the player. */
function toOutput(
  recipe: CrowniclesRecipe,
  context: OutputContext,
): RecipeOutput {
  switch (recipe.outputType) {
    case 'material': {
      const material = context.materialById.get(recipe.outputMaterialId);
      return {
        kind: 'material',
        name: material?.name ?? String(recipe.outputMaterialId),
        icon: material?.icon,
        quantity: recipe.outputMaterialQuantity,
      };
    }
    case 'potion': {
      const candidates =
        context.potionsByEffect.get(
          `${recipe.potionNature}:${recipe.potionRarity}`,
        ) ?? [];
      return {
        kind: 'potion',
        rarity: recipe.potionRarity,
        rarityName:
          context.rarityNames[recipe.potionRarity] ??
          String(recipe.potionRarity),
        candidates: candidates.map((potion) => ({
          name: potion.name,
          icon: potion.icon,
          nature: potion.nature,
          effect: natureEffectLine(
            context.potionNatures[potion.nature] ?? '',
            potion.nature,
            potion.power,
            context.locale,
          ),
        })),
      };
    }
    default: {
      const { type, quantity, lovePoints } = recipe.petFood;
      return {
        kind: 'petFood',
        name: foodName(context.foodNames, type, quantity),
        icon: context.foodIcons[type],
        quantity,
        lovePoints,
      };
    }
  }
}

/** Composes the recipes page data for `locale` (fetches sit behind TTL caches). */
export async function loadRecipesData(
  locale: SupportedLocale,
): Promise<CrowniclesRecipesData> {
  const [
    recipes,
    materials,
    plants,
    items,
    itemLang,
    recipeNames,
    foodNames,
    recipeTypeIcons,
    foodIcons,
    shopCosts,
    cookingRules,
    gradeNames,
    rarityNames,
  ] = await Promise.all([
    getCookingRecipes(),
    getMaterials(locale),
    getPlants(locale),
    getItems(locale),
    getItemLangStrings(locale),
    getRecipeNames(locale),
    getFoodNames(locale),
    getRecipeTypeIcons(),
    getFoodIcons(),
    getRecipeShopCosts(),
    getCookingRules(),
    getCookingGradeNames(locale),
    getMaterialRarityNames(locale),
  ]);

  const potionsByEffect = new Map<string, CrowniclesSupportItem[]>();
  for (const item of items) {
    // Id 0 of every category is the "no item equipped" placeholder.
    if (isMainItem(item) || item.category !== 'potions' || item.id === 0) {
      continue;
    }
    const key = `${item.nature}:${item.rarity}`;
    const list = potionsByEffect.get(key) ?? [];
    list.push(item);
    potionsByEffect.set(key, list);
  }
  for (const list of potionsByEffect.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const materialById = new Map(
    materials.map((material) => [material.id, material]),
  );
  const plantById = new Map(plants.map((plant) => [plant.id, plant]));
  const context: OutputContext = {
    locale,
    materialById,
    potionsByEffect,
    rarityNames: itemLang.rarityNames,
    potionNatures: itemLang.potionNatures,
    foodNames,
    foodIcons,
  };

  const positions = discoveryPositions(recipes);
  const recipesById = new Map<string, HelpRecipe>();
  const recipesByCategory = new Map<
    RecipeOutputType,
    Map<string, HelpRecipe[]>
  >(RECIPE_OUTPUT_TYPES.map((category) => [category, new Map()]));
  for (const recipe of recipes) {
    const byFamily = recipesByCategory.get(recipe.outputType);
    if (byFamily === undefined) continue;
    const helpRecipe: HelpRecipe = {
      id: recipe.id,
      name: recipeNames[recipe.id] ?? recipe.id,
      recipeType: recipe.recipeType,
      icon: recipeTypeIcons[recipe.recipeType],
      level: recipe.level,
      grade: gradeFor(recipe.level, cookingRules, gradeNames),
      discoverySource: recipe.discoveredByDefault
        ? undefined
        : recipe.discoverySource,
      discoveryPosition: positions.get(recipe.id),
      plants: recipe.plants.map((cost) =>
        toIngredient(cost.plantId, cost.quantity, plantById),
      ),
      materials: recipe.materials.map((cost) =>
        toIngredient(cost.materialId, cost.quantity, materialById),
      ),
      output: toOutput(recipe, context),
    };
    const family = byFamily.get(recipe.recipeType) ?? [];
    family.push(helpRecipe);
    byFamily.set(recipe.recipeType, family);
    recipesById.set(helpRecipe.id, helpRecipe);
  }
  for (const byFamily of recipesByCategory.values()) {
    for (const family of byFamily.values()) {
      family.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
    }
  }

  const maxRecipeLevel = recipes.reduce(
    (hardest, recipe) => Math.max(hardest, recipe.level),
    0,
  );

  return {
    recipesByCategory,
    recipesById,
    shopCosts,
    maxRecipeLevel,
    cooking: toCookingGuide(
      cookingRules,
      gradeNames,
      plants,
      rarityNames,
      maxRecipeLevel,
    ),
  };
}
