import {
  itemNatureIcons,
  itemRarityIcons,
  RECIPE_OUTPUT_TYPES,
  type RecipeOutputType,
} from '@/core/crownicles/index.js';
import { isAuthorized } from '@/core/permissions/index.js';
import type { SupportedLocale } from '@/core/types.js';
import { type Container, Separator, Text } from '@/discord/components/index.js';
import { formatNumber, formatPercent } from '@/discord/lang/number.js';
import { rankIcons, withIcon } from '@/discord/theme/icons.js';
import { md } from '@/discord/theme/markdown.js';
import type {
  CrowniclesRecipesData,
  DiscoveryPosition,
  HelpRecipe,
  RecipeIngredient,
  RecipeOutput,
  RecipePotionCandidate,
} from '../../data/recipes.js';
import type { HelpRenderContext, HelpState } from '../../page.js';
import {
  appendBackButton,
  appendPaginationControls,
  appendPickerStep,
  pickerPage,
} from '../../crownicles-help.ui.js';
import {
  recipeCategoryIcons,
  recipeDiscoveryIcons,
  recipeFactIcons,
} from '../../icons.js';
import {
  BACK_TO_CATEGORIES_ID,
  BACK_TO_FAMILIES_ID,
  BACK_TO_RECIPES_ID,
  CATEGORY_SELECT_ID,
  FAMILY_SELECT_ID,
  messages,
  RECIPE_SELECT_ID,
  RECIPES_NEXT_ID,
  RECIPES_PREV_ID,
} from './shared.js';

/** Key the game uses for a recipe every player already knows. */
const DEFAULT_DISCOVERY_SOURCE = 'DEFAULT';
/**
 * The one source that grants every eligible recipe at once rather than handing
 * them over one at a time, so the position rule does not apply to it.
 */
const COOKING_LEVEL_SOURCE = 'COOKING_LEVEL';

/** Localized label of an output category (material, potion, pet food). */
function categoryLabel(
  locale: SupportedLocale,
  category: RecipeOutputType,
): string {
  return messages(locale).categories[category];
}

/** Localized label of a recipe family, falling back to the raw `RecipeType`. */
function familyLabel(locale: SupportedLocale, family: string): string {
  return (
    (messages(locale).families as Record<string, string>)[family] ?? family
  );
}

/** The families of one output category, keyed by `RecipeType`. */
function familiesOf(
  data: CrowniclesRecipesData,
  category: RecipeOutputType,
): ReadonlyMap<string, readonly HelpRecipe[]> {
  return data.recipesByCategory.get(category) ?? new Map();
}

/** One selectable recipe family, with the emote and count its option shows. */
export interface RecipeFamily {
  readonly family: string;
  readonly icon: string | undefined;
  readonly count: number;
}

/**
 * The families of `category` with their counts, ordered by localized name. A
 * category holding a single family (materials) yields one entry, and the page
 * then skips the family step entirely.
 */
export function familyOptions(
  data: CrowniclesRecipesData,
  category: RecipeOutputType,
  locale: SupportedLocale,
): readonly RecipeFamily[] {
  return [...familiesOf(data, category)]
    .map(([family, recipes]) => ({
      family,
      icon: recipes[0]?.icon,
      count: recipes.length,
    }))
    .sort((a, b) =>
      familyLabel(locale, a.family).localeCompare(
        familyLabel(locale, b.family),
      ),
    );
}

/** The recipes of `category`, narrowed to `family` when the page browses one. */
export function recipesIn(
  data: CrowniclesRecipesData,
  category: RecipeOutputType,
  family: string | undefined,
): readonly HelpRecipe[] {
  const byFamily = familiesOf(data, category);
  return family === undefined
    ? [...byFamily.values()].flat()
    : (byFamily.get(family) ?? []);
}

/** The single potion a recipe yields, when the draw has only one outcome. */
function singlePotionCandidate(
  output: RecipeOutput,
): RecipePotionCandidate | undefined {
  return output.kind === 'potion' && output.candidates.length === 1
    ? output.candidates[0]
    : undefined;
}

/**
 * What one craft hands the player, as a single `icon text` line. Most potion
 * recipes have a single potion of their nature and rarity, so naming it beats
 * announcing a draw that has only one outcome.
 */
function outputLine(locale: SupportedLocale, output: RecipeOutput): string {
  const t = messages(locale);
  switch (output.kind) {
    case 'material':
      return withIcon(output.icon, t.amount(output.name, output.quantity));
    case 'potion': {
      const only = singlePotionCandidate(output);
      return only === undefined
        ? withIcon(
            recipeCategoryIcons.potion,
            t.randomPotion(output.rarityName),
          )
        : withIcon(
            only.icon ?? recipeCategoryIcons.potion,
            t.namedPotion(only.name, output.rarityName),
          );
    }
    case 'petFood':
      return withIcon(output.icon, t.foodAmount(output.quantity, output.name));
  }
}

/**
 * The picker's shorthand for {@link outputLine}: a potion shows its rarity
 * alone, the only thing that climbs from one tier of a family to the next.
 */
function outputSummary(locale: SupportedLocale, output: RecipeOutput): string {
  return output.kind === 'potion'
    ? withIcon(itemRarityIcons[output.rarity], output.rarityName)
    : outputLine(locale, output);
}

/** Renders ingredients as `icon name ×quantity` parts, comma-joined. */
function ingredientParts(
  locale: SupportedLocale,
  entries: readonly RecipeIngredient[],
): string {
  const t = messages(locale);
  return entries
    .map((entry) => withIcon(entry.icon, t.amount(entry.name, entry.quantity)))
    .join(', ');
}

/**
 * Whether the viewer's rank unlocks how a recipe is learnt: which source hands
 * it over, and at which milestone or price. Privileged data, like the materials
 * page and the equipment upgrade view; the `rank` command advertises it.
 */
function canViewDiscovery(context: HelpRenderContext): boolean {
  return isAuthorized('privileged', { rank: context.rank });
}

/** Localized way of learning the recipe, prefixed by its emote. */
function unlockLine(recipe: HelpRecipe, locale: SupportedLocale): string {
  const t = messages(locale);
  const source = recipe.discoverySource ?? DEFAULT_DISCOVERY_SOURCE;
  const label = (t.discoverySources as Record<string, string>)[source];
  return withIcon(recipeDiscoveryIcons[source], label ?? source);
}

/** Wording of a source that hands its recipes over one at a time. */
interface MilestoneWording {
  readonly rule: string;
  readonly position: (milestone: number) => string;
  readonly atLatest: (milestone: number) => string;
}

/**
 * The rule a milestone source follows, then the milestone that hands this
 * recipe over. That is {@link DiscoveryPosition.to}: the slot by which the
 * recipe is certainly known whatever order the game uses inside a difficulty.
 * Only when the difficulty is this recipe's alone is the slot exact rather than
 * an upper bound.
 */
function milestoneLines(
  wording: MilestoneWording,
  position: DiscoveryPosition | undefined,
): string[] {
  if (position === undefined) return [];
  const certain = position.from === position.to;
  return [
    wording.rule,
    certain ? wording.position(position.to) : wording.atLatest(position.to),
  ];
}

/** Same, for the two merchants: their prices are positional, so a slot is a price. */
function shopLines(
  locale: SupportedLocale,
  merchant: string,
  costs: readonly number[],
  position: DiscoveryPosition | undefined,
): string[] {
  if (position === undefined) return [];
  const d = messages(locale).discoveryDetails;
  const slot = position.to;
  const price = formatNumber(
    locale,
    costs[Math.min(slot - 1, costs.length - 1)] ?? 0,
  );
  return [
    d.shop.rule(merchant),
    position.from === slot
      ? d.shop.position(slot, price)
      : d.shop.atLatest(slot, price),
  ];
}

/**
 * How `recipe` is unlocked, spelled out: the rule its source follows, then the
 * slot this recipe falls in. Empty for a recipe known from the start.
 */
function unlockDetail(
  recipe: HelpRecipe,
  data: CrowniclesRecipesData,
  locale: SupportedLocale,
): readonly string[] {
  const t = messages(locale);
  const d = t.discoveryDetails;
  const position = recipe.discoveryPosition;

  switch (recipe.discoverySource) {
    case undefined:
      return [];
    case COOKING_LEVEL_SOURCE:
      return [d.cookingLevel(recipe.level)];
    case 'WITCH':
      return [d.witch];
    case 'FARMER':
      return shopLines(
        locale,
        t.merchants.FARMER,
        data.shopCosts.farmer,
        position,
      );
    case 'GASPARD_JO':
      return shopLines(
        locale,
        t.merchants.GASPARD_JO,
        data.shopCosts.gaspardJo,
        position,
      );
    case 'ISLAND_BOSS':
      return milestoneLines(d.islandBoss, position);
    case 'PLAYER_LEVEL_MILESTONE':
      return milestoneLines(d.playerLevel, position);
    case 'CAMPAIGN_MILESTONE':
      return milestoneLines(d.campaign, position);
    default:
      return [];
  }
}

/** Step 1: the output-category picker, listing each category and its recipe count. */
export function appendCategoryPicker(
  container: Container,
  data: CrowniclesRecipesData,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  const countOf = (category: RecipeOutputType): number =>
    recipesIn(data, category, undefined).length;

  appendPickerStep(container, {
    selectId: CATEGORY_SELECT_ID,
    placeholder: t.categoryPlaceholder,
    disabled: context.disabled,
    entries: RECIPE_OUTPUT_TYPES.map((category) => ({
      line: `${categoryLabel(context.locale, category)} (${countOf(category)})`,
      label: categoryLabel(context.locale, category),
      value: category,
      description: t.recipeCount(countOf(category)),
      icon: recipeCategoryIcons[category],
    })),
  });
}

/** Step 2: the families of the chosen category, listed with their recipe counts. */
export function appendFamilyPicker(
  container: Container,
  families: readonly RecipeFamily[],
  category: RecipeOutputType,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  container.add(
    new Text(t.selectedCategory(categoryLabel(context.locale, category))).size(
      'subtle',
    ),
  );

  appendPickerStep(container, {
    selectId: FAMILY_SELECT_ID,
    placeholder: t.familyPlaceholder,
    disabled: context.disabled,
    entries: families.map((entry) => ({
      line: `${familyLabel(context.locale, entry.family)} (${entry.count})`,
      label: familyLabel(context.locale, entry.family),
      value: entry.family,
      description: t.recipeCount(entry.count),
      icon: entry.icon,
    })),
  });

  appendBackButton(
    container,
    BACK_TO_CATEGORIES_ID,
    t.backToCategories,
    context,
  );
}

/** Step 3: the recipes of the chosen family, paginated, with a picker. */
export function appendRecipePicker(
  container: Container,
  options: {
    readonly data: CrowniclesRecipesData;
    readonly category: RecipeOutputType;
    /** Family being browsed, or `undefined` for a single-family category. */
    readonly family: string | undefined;
    readonly state: HelpState;
    readonly context: HelpRenderContext;
  },
): void {
  const { data, category, family, state, context } = options;
  const t = messages(context.locale);
  const recipes = recipesIn(data, category, family);
  /** A category with one family skipped that step, so its back goes further up. */
  const backId =
    family === undefined ? BACK_TO_CATEGORIES_ID : BACK_TO_FAMILIES_ID;
  const backLabel =
    family === undefined ? t.backToCategories : t.backToFamilies;

  const crumb = t.selectedCategory(categoryLabel(context.locale, category));
  container.add(
    new Text(
      family === undefined
        ? crumb
        : `${crumb} | ${t.selectedFamily(familyLabel(context.locale, family))}`,
    ).size('subtle'),
  );

  if (recipes.length === 0) {
    container.add(new Text(t.noRecipes));
    appendBackButton(container, backId, backLabel, context);
    return;
  }

  const { page, pageCount, slice } = pickerPage(recipes, state.recipesPage);

  appendPickerStep(container, {
    selectId: RECIPE_SELECT_ID,
    placeholder: t.recipePlaceholder,
    disabled: context.disabled,
    entries: slice.map((recipe) => ({
      line: `${recipe.name} - ${outputSummary(context.locale, recipe.output)}`,
      label: recipe.name,
      value: recipe.id,
      description: t.optionSummary(
        recipe.level,
        outputSummary(context.locale, recipe.output),
      ),
      icon: recipe.icon,
    })),
  });

  appendPaginationControls(container, {
    page,
    pageCount,
    prevId: RECIPES_PREV_ID,
    nextId: RECIPES_NEXT_ID,
    indicator: t.pageIndicator,
    previousLabel: t.previous,
    nextLabel: t.next,
    disabled: context.disabled,
  });

  appendBackButton(container, backId, backLabel, context);
}

/** The whole draw, when a potion recipe can yield more than one potion. */
function appendPotionCandidates(
  container: Container,
  output: RecipeOutput,
  locale: SupportedLocale,
): void {
  if (output.kind !== 'potion' || output.candidates.length < 2) return;
  const t = messages(locale);

  container.add(new Text(t.potionCandidatesLabel).size('small'));
  const list = new Text('');
  for (const candidate of output.candidates) {
    /** The nature emote fronts the effect, as it does on the equipment page. */
    const effect = withIcon(
      itemNatureIcons[candidate.nature],
      candidate.effect,
    );
    const label = candidate.effect
      ? `${candidate.name} - ${effect}`
      : candidate.name;
    list.newLine(new Text(label).icon(candidate.icon).size('subtle'));
  }
  container.add(list, new Separator());
}

/** What the recipe yields, what it takes to craft it, and how it is learnt. */
function appendRecipeFacts(
  container: Container,
  data: CrowniclesRecipesData,
  recipe: HelpRecipe,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  const fact = (label: string, value: string): string =>
    t.fact(md.bold(label), value);

  const facts = new Text(
    fact(t.outputLabel, outputLine(context.locale, recipe.output)),
  );
  /** A lone possible potion is named above, so its effect belongs right here. */
  const only = singlePotionCandidate(recipe.output);
  if (only?.effect) {
    facts.newLine(withIcon(itemNatureIcons[only.nature], only.effect));
  }
  if (recipe.output.kind === 'petFood') {
    facts.newLine(
      withIcon(
        recipeFactIcons.lovePoints,
        fact(t.lovePointsLabel, String(recipe.output.lovePoints)),
      ),
    );
  }
  facts.newLine(
    withIcon(
      recipeFactIcons.level,
      fact(t.levelLabel, t.levelValue(recipe.level, data.maxRecipeLevel)),
    ),
  );
  if (recipe.grade) {
    facts.newLine(
      withIcon(
        recipeFactIcons.grade,
        fact(
          t.gradeLabel,
          t.gradeValue(recipe.grade.name, recipe.grade.minCookingLevel),
        ),
      ),
    );
  }
  /** How the recipe is learnt is a privileged perk; others see it locked. */
  const showsDiscovery = canViewDiscovery(context);
  facts.newLine(
    showsDiscovery
      ? withIcon(
          recipeFactIcons.unlock,
          fact(t.unlockLabel, unlockLine(recipe, context.locale)),
        )
      : withIcon(rankIcons.privileged, fact(t.unlockLabel, t.unlockLocked)),
  );
  container.add(facts);

  /**
   * A difficulty means nothing on its own, so it is spelled out as the odds of
   * botching the craft. When even the opening grade takes no penalty, those
   * odds still fall with every grade, so the span runs bottom to top instead.
   */
  if (recipe.grade !== undefined) {
    const { failureRate, worstFailureRate, bestFailureRate } = recipe.grade;
    const percent = (rate: number): string =>
      formatPercent(context.locale, rate);
    container.add(
      new Text(
        failureRate === worstFailureRate
          ? t.gradeRiskFlat(percent(worstFailureRate), percent(bestFailureRate))
          : t.gradeRisk(percent(failureRate), percent(worstFailureRate)),
      ).size('subtle'),
    );
  }

  if (showsDiscovery) {
    for (const line of unlockDetail(recipe, data, context.locale)) {
      container.add(new Text(line).size('subtle'));
    }
  }
  container.add(new Separator());
}

/** Step 4: one recipe's details - what it yields, how it is learnt, what it costs. */
export function appendRecipeDetail(
  container: Container,
  data: CrowniclesRecipesData,
  recipe: HelpRecipe,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  container.add(
    new Text(recipe.name).bold().icon(recipe.icon),
    new Separator(),
  );

  appendRecipeFacts(container, data, recipe, context);
  appendPotionCandidates(container, recipe.output, context.locale);

  container.add(new Text(t.ingredientsLabel).size('small'));
  if (recipe.plants.length === 0 && recipe.materials.length === 0) {
    container.add(new Text(t.noIngredients).size('subtle'));
  }
  if (recipe.plants.length > 0) {
    container.add(
      new Text(
        t.fact(
          md.bold(t.plantsLabel),
          ingredientParts(context.locale, recipe.plants),
        ),
      )
        .icon(recipeFactIcons.plants)
        .size('subtle'),
    );
  }
  if (recipe.materials.length > 0) {
    container.add(
      new Text(
        t.fact(
          md.bold(t.materialsLabel),
          ingredientParts(context.locale, recipe.materials),
        ),
      )
        .icon(recipeFactIcons.materials)
        .size('subtle'),
    );
  }

  appendBackButton(container, BACK_TO_RECIPES_ID, t.backToRecipes, context);
}
