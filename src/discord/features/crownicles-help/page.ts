import type { MessageComponentInteraction } from 'discord.js';
import type { SupportedLocale } from '@/core/types.js';
import type { Container } from '@/discord/components/index.js';
import type { CrowniclesHelpData } from './data.js';

/**
 * Shared state of the help center, threaded through every page. Optional fields
 * accept `undefined` so a navigation reset (`{ ...state, selectedEventId:
 * undefined }`) type-checks under `exactOptionalPropertyTypes`.
 */
export interface HelpState {
  readonly pageId: string;
  /** Help data, loaded once on entering a data-backed page, then reused. */
  readonly data?: CrowniclesHelpData | undefined;
  /** True when the last data load failed, so pages can show an error. */
  readonly dataError?: boolean | undefined;
  /** Zero-based pagination index of the location picker. */
  readonly locationsPage?: number | undefined;
  /** Location whose events are being browsed. */
  readonly selectedLocationId?: number | undefined;
  /** Event whose outcomes are being shown. */
  readonly selectedEventId?: number | undefined;
}

/** Context passed to a page's `render`. */
export interface HelpRenderContext {
  readonly locale: SupportedLocale;
  /** Pages the category select offers, in menu order. */
  readonly pages: readonly HelpPage[];
  /** True on the final render, once the message stops collecting. */
  readonly disabled: boolean;
}

/**
 * One category of the help center. A page renders its own content container and
 * folds a component interaction into the next state; the router owns the shared
 * category select (always placed below the container) and the network loading.
 */
export interface HelpPage {
  readonly id: string;
  /** Emote shown in the category select and page title. */
  readonly icon: string;
  /** Whether opening this page needs the network-loaded help data. */
  readonly requiresData: boolean;
  /** Localized category label for the select. */
  name(locale: SupportedLocale): string;
  /** Localized category description for the select. */
  description(locale: SupportedLocale): string;
  render(state: HelpState, context: HelpRenderContext): Container;
  reduce(
    state: HelpState,
    interaction: MessageComponentInteraction,
  ): HelpState | Promise<HelpState>;
}
