import type { CommandAuthorization } from '@/core/permissions/types.js';
import type {
  CrowniclesItem,
  ItemCategory,
  CrowniclesMap,
} from '@/core/crownicles/index.js';
import type { Container } from '@/discord/components/index.js';
import type { ReduceContext } from '@/discord/interactions/collector.js';
import type { CollectedInteraction } from 'discord.js';

/** Shared state of the help center. */
export interface HelpState {
  pageId: string;
  /** Id of the league currently selected on the leagues page. */
  selectedLeagueId?: string;
  /** Rank bonus computed after a rank submission; undefined until the modal is submitted. */
  rankBonus?: number;
  /** Category currently open on the equipment page. */
  itemCategory?: ItemCategory;
  /** Items loaded for `itemCategory`; undefined while loading. */
  items?: readonly CrowniclesItem[];
  /** True if the last item load failed, so the page can show an error. */
  itemsError?: boolean;
  /** Rarity currently filtered on the equipment page. */
  itemRarity?: number;
  /** Zero-based pagination index on the equipment page. */
  itemPage?: number;
  /** Continent map ; undefined during loading. */
  pathMap?: CrowniclesMap;
  /** true if the last map load failed */
  pathMapError?: boolean;
  /** Type selected */
  pathType?: string;
  /** Location start */
  pathFromId?: number;
  /** Destination choosed */
  pathToId?: number;
  /** True once the user hit the daily pathfinder limit; shows the limit notice. */
  pathLimitReached?: boolean;
}

/**
 * Passed to a page's `render`. `disabled` is true once the menu times out;
 * `visiblePages` and `totalPageCount` let the home page build the nav select
 * and show a notice when some pages are hidden by authorization.
 */
export interface HelpRenderContext {
  disabled: boolean;
  visiblePages: readonly HelpPage[];
  totalPageCount: number;
}

/**
 * One page of the Crownicles help center. A page knows how to draw itself
 * (`render`) and react to a click/select on it (`reduce`), mirroring the
 * Render/Reduce contract of `InteractiveMessage` so the router can drive every
 * page through a single collector.
 */
export interface HelpPage {
  id: string;
  /** Display name used in the navigation select menu. */
  name: string;
  /** Short description shown under the name in the navigation select menu. */
  description?: string;
  /** Optional emoji displayed next to the name in the navigation select menu. */
  icon?: string;
  requiredAuthorization: CommandAuthorization;
  render(state: HelpState, ctx: HelpRenderContext): Container;
  reduce(
    interaction: CollectedInteraction,
    state: HelpState,
    ctx: ReduceContext,
    /**
     * Render context at the time of the interaction — lets a page re-render
     * itself inline (e.g. via `submit.update()`) without going through the
     * router's render callback.
     */
    renderCtx: HelpRenderContext,
  ): Promise<HelpState> | HelpState;
}
