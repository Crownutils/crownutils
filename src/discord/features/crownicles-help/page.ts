import type { MessageComponentInteraction } from 'discord.js';
import type { ItemCategory } from '@/core/crownicles/index.js';
import type { Authorization } from '@/core/permissions/index.js';
import type { Rank, SupportedLocale } from '@/core/types.js';
import type { Container } from '@/discord/components/index.js';
import type { CrowniclesEquipmentData } from './data/equipment.js';
import type { CrowniclesHelpData } from './data/events.js';
import type { CrowniclesMaterialsData } from './data/materials.js';

/**
 * Shared state of the help center, threaded through every page. Optional fields
 * accept `undefined` so a navigation reset (`{ ...state, selectedEventId:
 * undefined }`) type-checks under `exactOptionalPropertyTypes`. Each data-backed
 * page keeps its own loaded-data slot, so entering one never loads another's.
 */
export interface HelpState {
  readonly pageId: string;
  /** Events/locations data, loaded on entering the events pages. */
  readonly data?: CrowniclesHelpData | undefined;
  /** Materials data, loaded on entering the materials page. */
  readonly materialsData?: CrowniclesMaterialsData | undefined;
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
  ): HelpState | Promise<HelpState>;
  /** Loads this page's data into a state patch on first entry; absent when the page needs no network data. */
  loadData?(locale: SupportedLocale): Promise<Partial<HelpState>>;
  /** Whether this page's data is already present in `state` (data-backed pages only). */
  hasData?(state: HelpState): boolean;
}
