import type { MessageComponentInteraction } from 'discord.js';
import type {
  ItemCategory,
  RecipeOutputType,
} from '@/core/crownicles/index.js';
import type { Authorization } from '@/core/permissions/index.js';
import type { Rank, SupportedLocale } from '@/core/types.js';
import type { Container } from '@/discord/components/index.js';
import type { ReduceContext } from '@/discord/interactions/index.js';
import type { CrowniclesEquipmentData } from './data/equipment.js';
import type { CrowniclesEventsData } from './data/events.js';
import type { CrowniclesMaterialsData } from './data/materials.js';
import type { CrowniclesRecipesData } from './data/recipes.js';

/** The three things the recipes page answers, picked at its first step. */
export type RecipesSection = 'browse' | 'xp' | 'failure';

/**
 * Shared state of the help center, threaded through every page. Optional fields
 * accept `undefined` so a navigation reset (`{ ...state, selectedEventId:
 * undefined }`) type-checks under `exactOptionalPropertyTypes`. Each data-backed
 * page keeps its own loaded-data slot, so entering one never loads another's.
 */
export interface HelpState {
  readonly pageId: string;
  /** Events/locations data, loaded on entering the events pages. */
  readonly data?: CrowniclesEventsData | undefined;
  /** Materials data, loaded on entering the materials page. */
  readonly materialsData?: CrowniclesMaterialsData | undefined;
  /** Cooking recipes data, loaded on entering the recipes page. */
  readonly recipesData?: CrowniclesRecipesData | undefined;
  /** True when the last data load failed, so pages can show an error. */
  readonly loadError?: boolean | undefined;

  /** Zero-based pagination index of the location picker. */
  readonly locationsPage?: number | undefined;
  /** Location whose events are being browsed. */
  readonly selectedLocationId?: number | undefined;
  /** Event whose outcomes are being shown. */
  readonly selectedEventId?: number | undefined;

  /** Material type currently browsed. */
  readonly selectedType?: string | undefined;
  /** Material whose details are being shown. */
  readonly selectedMaterialId?: number | undefined;
  /** Zero-based pagination index of the material picker. */
  readonly materialsPage?: number | undefined;

  /** Which part of the recipes page is open: the listing or one of its rules sections. */
  readonly recipesSection?: RecipesSection | undefined;
  /** Recipe output category currently browsed. */
  readonly selectedRecipeOutput?: RecipeOutputType | undefined;
  /** Recipe family (`RecipeType`) currently browsed; unused by single-family categories. */
  readonly selectedRecipeFamily?: string | undefined;
  /** Recipe whose details are being shown. */
  readonly selectedRecipeId?: string | undefined;
  /** Zero-based pagination index of the recipe picker. */
  readonly recipesPage?: number | undefined;

  /** Equipment data, loaded on entering the equipment page. */
  readonly equipmentData?: CrowniclesEquipmentData | undefined;
  /** Item category currently browsed. */
  readonly selectedItemCategory?: ItemCategory | undefined;
  /** Item rarity currently browsed. */
  readonly selectedItemRarity?: number | undefined;
  /** Item whose details are being shown. */
  readonly selectedItemId?: number | undefined;
  /** Zero-based pagination index of the item picker. */
  readonly itemsPage?: number | undefined;
  /** Zero-based upgrade level shown in the upgrade view; `undefined` shows the item detail. */
  readonly upgradesPage?: number | undefined;

  /** Starting level to calculate xp needed. */
  readonly fromLevel?: number | undefined;
  /** Target level to calculate xp needed. */
  readonly toLevel?: number | undefined;
}

/**
 * The framework reduce context (`stop`, `markHandled`, `showModal`) plus the
 * ambient locale and rank a page needs to build its components and modals. The
 * runtime owns the modal sub-flow and its re-render, so a page only declares the
 * modal and how to fold its submission into the next state.
 */
export interface HelpReduceContext extends ReduceContext<HelpState> {
  readonly locale: SupportedLocale;
  readonly rank: Rank;
}

/** Context passed to a page's `render`. */
export interface HelpRenderContext {
  readonly locale: SupportedLocale;
  /** Pages the category select offers, in menu order. */
  readonly pages: readonly HelpPage[];
  /** True on the final render, once the message stops collecting. */
  readonly disabled: boolean;
  /** The viewer's rank, so a page can gate parts of its content. */
  readonly rank: Rank;
}

/**
 * One category of the help center. A page renders its own content container and
 * folds a component interaction into the next state; the router owns the shared
 * category select (always placed below the container) and the network loading.
 * A data-backed page declares `loadData` (and `hasData`); the router calls it
 * once on first entry.
 */
export interface HelpPage {
  readonly id: string;
  /** Minimum rank required to see and open this page. */
  readonly authorization: Authorization;
  /** Emote shown in the category select and page title. */
  readonly icon: string;
  /** Localized category label for the select. */
  name(locale: SupportedLocale): string;
  /** Localized category description for the select. */
  description(locale: SupportedLocale): string;
  render(state: HelpState, context: HelpRenderContext): Container;
  reduce(
    state: HelpState,
    interaction: MessageComponentInteraction,
    context: HelpReduceContext,
  ): HelpState | Promise<HelpState>;
  /** Loads this page's data into a state patch on first entry; absent when the page needs no network data. */
  loadData?(locale: SupportedLocale): Promise<Partial<HelpState>>;
  /** Whether this page's data is already present in `state` (data-backed pages only). */
  hasData?(state: HelpState): boolean;
}
