import type { SupportedLocale } from '@/core/types.js';
import { helpMessages } from '../../crownicles-help.ui.js';

/**
 * The pieces the three modules of the recipes page share: its wording accessor
 * and the custom ids its controls carry. Ids live here so `render` and `reduce`
 * cannot drift apart, and so neither module has to import the other.
 */

/** The `recipes` node of the crownicles-help language pack. */
export function messages(locale: SupportedLocale) {
  return helpMessages(locale).recipes;
}

export const SECTION_SELECT_ID = 'chelp-rec-section';
export const CATEGORY_SELECT_ID = 'chelp-rec-category';
export const FAMILY_SELECT_ID = 'chelp-rec-family';
export const RECIPE_SELECT_ID = 'chelp-recipe';
export const RECIPES_PREV_ID = 'chelp-rec-prev';
export const RECIPES_NEXT_ID = 'chelp-rec-next';
export const BACK_TO_SECTIONS_ID = 'chelp-rec-back-sections';
export const BACK_TO_CATEGORIES_ID = 'chelp-rec-back-categories';
export const BACK_TO_FAMILIES_ID = 'chelp-rec-back-families';
export const BACK_TO_RECIPES_ID = 'chelp-rec-back-recipes';
