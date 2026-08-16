import type { MessageComponentInteraction } from 'discord.js';
import {
  RECIPE_OUTPUT_TYPES,
  type RecipeOutputType,
} from '@/core/crownicles/index.js';
import type { SupportedLocale } from '@/core/types.js';
import { type Container, Text } from '@/discord/components/index.js';
import { md } from '@/discord/theme/markdown.js';
import { loadRecipesData } from '../../data/recipes.js';
import type {
  HelpPage,
  HelpRenderContext,
  HelpState,
  RecipesSection,
} from '../../page.js';
import {
  appendBackButton,
  appendLoadFallback,
  appendPickerStep,
  clampPage,
  createHelpPageContainer,
  pickerPageCount,
} from '../../crownicles-help.ui.js';
import { pageIcons, recipeSectionIcons } from '../../icons.js';
import {
  appendCategoryPicker,
  appendFamilyPicker,
  appendRecipeDetail,
  appendRecipePicker,
  familyOptions,
  recipesIn,
} from './browse.js';
import {
  appendCookingXpSection,
  appendFailureSection,
} from './cooking-rules.js';
import {
  BACK_TO_CATEGORIES_ID,
  BACK_TO_FAMILIES_ID,
  BACK_TO_RECIPES_ID,
  BACK_TO_SECTIONS_ID,
  CATEGORY_SELECT_ID,
  FAMILY_SELECT_ID,
  messages,
  RECIPE_SELECT_ID,
  RECIPES_NEXT_ID,
  RECIPES_PREV_ID,
  SECTION_SELECT_ID,
} from './shared.js';

/** Router id of the recipes page. */
export const RECIPES_PAGE_ID = 'recipes';

const RECIPES_ICON = pageIcons.recipes;

/** The page's first step, in menu order. */
const RECIPES_SECTIONS: readonly RecipesSection[] = ['browse', 'xp', 'failure'];

/** Step 0: which of the page's three questions the reader wants answered. */
function appendSectionPicker(
  container: Container,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  appendPickerStep(container, {
    selectId: SECTION_SELECT_ID,
    placeholder: t.sectionPlaceholder,
    disabled: context.disabled,
    entries: RECIPES_SECTIONS.map((section) => ({
      line: `${md.bold(t.sections[section])} - ${t.sectionDescriptions[section]}`,
      label: t.sections[section],
      value: section,
      description: t.sectionDescriptions[section],
      icon: recipeSectionIcons[section],
    })),
  });
}

/** The listing branch: category, then family, down to one recipe's detail. */
function renderBrowse(
  container: Container,
  state: HelpState,
  data: NonNullable<HelpState['recipesData']>,
  context: HelpRenderContext,
): void {
  const t = messages(context.locale);
  const category = state.selectedRecipeOutput;

  if (category === undefined) {
    appendCategoryPicker(container, data, context);
    appendBackButton(container, BACK_TO_SECTIONS_ID, t.backToSections, context);
    return;
  }

  /** The detail wins over the pickers, whichever step led to it. */
  if (state.selectedRecipeId !== undefined) {
    const recipe = data.recipesById.get(state.selectedRecipeId);
    if (recipe === undefined) {
      container.add(new Text(t.recipeNotFound).size('subtle'));
      appendBackButton(container, BACK_TO_RECIPES_ID, t.backToRecipes, context);
      return;
    }
    appendRecipeDetail(container, data, recipe, context);
    return;
  }

  const families = familyOptions(data, category, context.locale);
  /** Single-family categories (materials) go straight to their recipe list. */
  const hasFamilyStep = families.length > 1;

  if (hasFamilyStep && state.selectedRecipeFamily === undefined) {
    appendFamilyPicker(container, families, category, context);
    return;
  }
  appendRecipePicker(container, {
    data,
    category,
    family: hasFamilyStep ? state.selectedRecipeFamily : undefined,
    state,
    context,
  });
}

/** Cooking recipes browsable by category, then family, down to one recipe's detail. */
export const recipesPage: HelpPage = {
  id: RECIPES_PAGE_ID,
  authorization: 'normal',
  icon: RECIPES_ICON,

  loadData: async (locale) => ({
    recipesData: await loadRecipesData(locale),
  }),
  hasData: (state) => state.recipesData !== undefined,

  name: (locale: SupportedLocale) => messages(locale).name,
  description: (locale: SupportedLocale) => messages(locale).description,

  render(state: HelpState, context: HelpRenderContext) {
    const t = messages(context.locale);
    const container = createHelpPageContainer(RECIPES_ICON, t.name, t.intro);

    const data = state.recipesData;
    if (data === undefined) {
      appendLoadFallback(container, state, context.locale);
      return container;
    }

    if (state.recipesSection === undefined) {
      appendSectionPicker(container, context);
      return container;
    }
    if (state.recipesSection !== 'browse') {
      const append =
        state.recipesSection === 'xp'
          ? appendCookingXpSection
          : appendFailureSection;
      append(container, data.cooking, context.locale);
      appendBackButton(
        container,
        BACK_TO_SECTIONS_ID,
        t.backToSections,
        context,
      );
      return container;
    }

    renderBrowse(container, state, data, context);
    return container;
  },

  reduce(state: HelpState, interaction: MessageComponentInteraction) {
    if (interaction.isStringSelectMenu()) {
      const value = interaction.values[0];
      if (value === undefined) return state;
      if (interaction.customId === SECTION_SELECT_ID) {
        const section = RECIPES_SECTIONS.find((entry) => entry === value);
        return section === undefined
          ? state
          : {
              ...state,
              recipesSection: section,
              selectedRecipeOutput: undefined,
              selectedRecipeFamily: undefined,
              selectedRecipeId: undefined,
              recipesPage: 0,
            };
      }
      if (interaction.customId === CATEGORY_SELECT_ID) {
        const category: RecipeOutputType | undefined = RECIPE_OUTPUT_TYPES.find(
          (entry) => entry === value,
        );
        return category === undefined
          ? state
          : {
              ...state,
              selectedRecipeOutput: category,
              selectedRecipeFamily: undefined,
              selectedRecipeId: undefined,
              recipesPage: 0,
            };
      }
      if (interaction.customId === FAMILY_SELECT_ID) {
        return {
          ...state,
          selectedRecipeFamily: value,
          selectedRecipeId: undefined,
          recipesPage: 0,
        };
      }
      if (interaction.customId === RECIPE_SELECT_ID) {
        return { ...state, selectedRecipeId: value };
      }
      return state;
    }

    if (interaction.isButton()) {
      const recipes =
        state.selectedRecipeOutput !== undefined && state.recipesData
          ? recipesIn(
              state.recipesData,
              state.selectedRecipeOutput,
              state.selectedRecipeFamily,
            )
          : [];
      switch (interaction.customId) {
        case RECIPES_PREV_ID:
          return {
            ...state,
            recipesPage: Math.max(0, (state.recipesPage ?? 0) - 1),
          };
        case RECIPES_NEXT_ID:
          return {
            ...state,
            recipesPage: clampPage(
              (state.recipesPage ?? 0) + 1,
              pickerPageCount(recipes.length),
            ),
          };
        case BACK_TO_SECTIONS_ID:
          return {
            ...state,
            recipesSection: undefined,
            selectedRecipeOutput: undefined,
            selectedRecipeFamily: undefined,
            selectedRecipeId: undefined,
          };
        case BACK_TO_CATEGORIES_ID:
          return {
            ...state,
            selectedRecipeOutput: undefined,
            selectedRecipeFamily: undefined,
            selectedRecipeId: undefined,
          };
        case BACK_TO_FAMILIES_ID:
          return {
            ...state,
            selectedRecipeFamily: undefined,
            selectedRecipeId: undefined,
          };
        case BACK_TO_RECIPES_ID:
          return { ...state, selectedRecipeId: undefined };
        default:
          return state;
      }
    }

    return state;
  },
};
